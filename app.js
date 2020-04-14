var DataBase = openDatabase('RecordsDatabase', '1.0', 'Test DB', 2*1024*1024);

function AppViewModel() {
    let self = this;
    self.add_note_text = ko.observable('Add note');
    self.back_btn_text = ko.observable('Back');
    self.heading_text = ko.observable("Write heading");
    self.body_text = ko.observable("Note");
    self.save_btn_text = ko.observable("Save");
    self.notes_heading = ko.observable('Notes:');
    self.search = ko.observable('Search...');
    self.save_record = function() {
        DataBase.transaction(function (tx) {
            tx.executeSql("INSERT INTO RecordsDatabase (record) VALUES ('" +
                ko.toJSON(self.record()) + "')");
        });
        self.get_records();
        $( ":mobile-pagecontainer" ).pagecontainer( "change", "#MainPage", { transition: "fade" } );
    };

    self.tags_array = ['Meetings', 'Purchases'];
    self.tags_to_seek = ko.observableArray([]);
    self.tags_to_seek.subscribe(function () {
        if (self.tags_to_seek().length !== 0) {
            // alert(1)
            let arr = [];
                self.records().forEach(function (item) {
                    for (let i = 0; i < item.tags.length; ++i) {
                        if (self.tags_to_seek().indexOf(item.tags[i]) !== -1) {
                            arr.push(item);
                            break;
                        }
                    }
                });
                self.records_to_show(arr);
        } else {
                self.records_to_show(self.records());
        }
    });

    self.get_records = function() {
        let arr = [];
        DataBase.transaction(function(tx) {
            tx.executeSql("SELECT record FROM RecordsDatabase", [], function(tx, results) {
                for (let i = 0; i < results.rows.length; i++) {
                    arr.push(JSON.parse(results.rows[i].record));
                }
                self.records(arr.reverse());
                self.search('');
                self.records_to_show(self.records());
            });
        });
    };

    DataBase.transaction(function (tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS RecordsDatabase (record text)');
    });

    self.add_note = function() {
        self.record().heading();
        self.record().body();
        self.record().tags([]);
        $( ":mobile-pagecontainer" ).pagecontainer( "change", "#Note", { transition: "fade" } );
    };

    self.choose_note = function(record) {
        self.record().heading(record.heading);
        self.record().body(record.body);
        self.record().tags(record.tags);
        $( ":mobile-pagecontainer" ).pagecontainer( "change", "#Note", { transition: "fade" } );
    };

    self.refreshRecords = function() {  //функция, обновляющая информацию в списке записей

    };

    self.records = ko.observableArray();
    self.records_to_show = ko.observableArray();

    self.record = ko.observable({
        "heading": ko.observable(''),
        "body": ko.observable(''),
        "tags": ko.observableArray([]),
    });

    self.get_records();

    self.show_camera_btn_text = ko.observable('Make a photo');
    self.show_camera_func = ()=>{
        if (!self.show_camera()) {
            self.show_camera(true);
            self.show_camera_btn_text('Turn off the camera');

            // Get access to the camera!
            if(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                // Not adding `{ audio: true }` since we only want video now
                navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
                    let video = document.getElementById('video');
                    video.srcObject = stream;
                    video.play();
                    self.webcamStream = stream;
                });
            }

            var canvas = document.getElementById('canvas');
            var context = canvas.getContext('2d');

            document.getElementById("snap").addEventListener("click", function() {
                context.drawImage(video, 0, 0, 640, 480);
            });
        } else {
            self.webcamStream.getTracks()[1].stop();
            self.show_camera(false);
            self.show_camera_btn_text('Make a photo')
        }
    };
    self.show_camera = ko.observable(false);

    self.name = ko.observable('');
    self.name.subscribe(function() {
        if (self.name() !== undefined && self.name() !== '') {
            let str = new RegExp(self.name(), 'i');
            let arr = [];
            if (self.name().length > 0) {
                self.records().forEach(function (item) {
                    if (str.test(item.heading)) {
                        arr.push(item)
                    }
                })
            }
            self.records_to_show(arr);
        }
        else {
            self.records_to_show(self.records());
        }
    })
}

function readImageURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            $('#blah')
                .attr('src', e.target.result)
                .width(128)
                .height(128);
        };

        reader.readAsDataURL(input.files[0]);
    }
}

ko.bindingHandlers.placeholder = {  // бинд, отвечающий за серый фоновый текст в input
    init: function (element, valueAccessor, allBindingsAccessor) {
        let underlyingObservable = valueAccessor();
        ko.applyBindingsToNode(element, { attr: { placeholder: underlyingObservable } } );
    }
};

ko.applyBindings(new AppViewModel());