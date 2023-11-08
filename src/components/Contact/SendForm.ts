import { pb } from "@/pb/pocketbase";

interface FormData {
    name: string;
    email: string;
    message: string;
}

const sendForm = async (data: FormData) => {
    try {
        const response = await pb.collection("inbox").create(data);
        return response;
    } catch (e: any) {
        throw new Error(e.message);
    }
};

export default sendForm;
