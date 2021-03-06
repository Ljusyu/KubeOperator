import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Cluster} from "../../../../cluster";
import {StorageProvisionerService} from "../storage-provisioner.service";
import {StorageProvisioner} from "../storage-provisioner";
import {KubernetesService} from '../../../../kubernetes.service';
import {ModalAlertService} from '../../../../../../shared/common-component/modal-alert/modal-alert.service';
import {AlertLevels} from '../../../../../../layout/common-alert/alert';
import {TranslateService} from '@ngx-translate/core';

@Component({
    selector: 'app-storage-provisioner-delete',
    templateUrl: './storage-provisioner-delete.component.html',
    styleUrls: ['./storage-provisioner-delete.component.css']
})
export class StorageProvisionerDeleteComponent implements OnInit {

    constructor(private service: StorageProvisionerService,
                private kubernetesService: KubernetesService,
                private modalAlertService: ModalAlertService,
                private translateService: TranslateService) {
    }

    opened = false;
    items: StorageProvisioner[] = [];
    @Output() deleted = new EventEmitter();
    @Input() currentCluster: Cluster;

    ngOnInit(): void {
    }

    open(items: StorageProvisioner[]) {
        this.opened = true;
        this.items = items;
    }

    onSubmit() {
        this.kubernetesService.listStorageClass(this.currentCluster.name).subscribe(data => {
            const scs = data.items;
            let result = true;
            for (const sc of scs) {
                for (const item of this.items) {
                    if (sc.provisioner === item.name) {
                        result = false;
                        break;
                    }
                }
            }
            if (!result) {
                this.modalAlertService.showAlert(this.translateService.instant('PROVISIONER_DELETE_FAILED'), AlertLevels.ERROR);
                return;
            }
            this.service.batch(this.currentCluster.name, this.items).subscribe(res => {
                this.opened = false;
                this.deleted.emit();
            });
        });

    }

    onCancel() {
        this.opened = false;
    }
}
