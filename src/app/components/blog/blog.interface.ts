export interface Blog {
    id: string;
    title: string;
    paras: Paras[];
}

export interface Paras {
    content: string;
}