export default interface IRequest {
    encodedString: string;
    method: string;
    url: string;
    status?: number | null;
    time?: number | null;
    unknown?: number | null;
}