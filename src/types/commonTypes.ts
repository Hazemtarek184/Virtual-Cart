export interface IPhotoType {
    buffer: Buffer;
    mimetype: string;
}

export interface IEmitUserPhoto {
    userPhoto: IPhotoType;
    token: string;
}

export interface IEmitNewItem {
    itemName: string;
    token: string;
    state: string;
}