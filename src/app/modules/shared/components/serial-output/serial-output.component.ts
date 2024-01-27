import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnInit,
    QueryList,
    ViewChild,
    ViewChildren
} from '@angular/core';
import {ChartOptions} from 'chart.js';
import 'chartjs-adapter-moment';
import {DialogState} from 'src/app/state/dialog.state';
import {RobotWiredState} from 'src/app/state/robot.wired.state';
import {MatDialogRef} from "@angular/material/dialog";
import {unparse} from 'papaparse';

@Component({
    selector: 'app-serial-output',
    templateUrl: './serial-output.component.html',
    styleUrls: ['./serial-output.component.scss']
})
export class SerialOutputComponent implements AfterViewInit, OnInit {

    @ViewChildren('messages') messages: QueryList<any>;
    @ViewChild('content') content: ElementRef;


    constructor(
        public robotWiredState: RobotWiredState,
        public dialogState: DialogState,
        private changeDetectorRef: ChangeDetectorRef,
        private dialog: MatDialogRef<SerialOutputComponent>
    ) { }

    ngOnInit(): void {
        this.robotWiredState.serialData$.subscribe(() => {
            this.changeDetectorRef.detectChanges();
            this.scrollToBottom();
        });
    }


    exportToCsv() {
        let data = document.getElementsByClassName("output-item")
        let dataArr = [];
        for (let i = 0; i < data.length; i++) {
            let row = data[i].getElementsByTagName('td');
            let rowData = [];
            for (let j = 0; j < row.length; j++) {
                rowData.push(row[j].innerHTML);
            }
            dataArr.push(rowData);
        }
        // convert to json
        let dataJson = [];
        for (let i = 0; i < dataArr.length; i++) {
            let dataObj = {};
            for (let j = 0; j < dataArr[i].length; j++) {
                dataObj[dataArr[0][j]] = dataArr[i][j];
            }
            dataJson.push(dataObj);
        }
        let filename = 'serial_monitor_export.csv'
        console.log(dataJson);

        const csv = unparse(dataJson, {
            header: true
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }}

    ngAfterViewInit() {
        //https://stackoverflow.com/a/45655337/1056283
        this.scrollToBottom();
        this.messages.changes.subscribe(this.scrollToBottom);
    }

    scrollToBottom = () => {
        try {
            this.content.nativeElement.scrollTop = this.content.nativeElement.scrollHeight;
        } catch (err) {
            console.log("Error while attempting scroll to bottom:", err);
        }
    }

    public onViewTextOutputClicked() {
        this.dialogState.setIsSerialGraphOutputSelected(false);
    }

    public onViewGraphOutputClicked() {
        this.dialogState.setIsSerialGraphOutputSelected(true);
    }

    public onClearSerialDataClicked() {
        this.robotWiredState.clearSerialData();
    }

    public onCloseClicked() {
        this.dialog.close();
    }

    public lineChartOptions: ChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 0
        },
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'second',
                    displayFormats: {
                        millisecond: 'HH:mm:ss:SSS'
                    }
                },
                position: 'bottom'
            }
        }
    };

    public lineChartLegend = true;
    public lineChartType = 'line';
    public lineChartPlugins = [];
}
