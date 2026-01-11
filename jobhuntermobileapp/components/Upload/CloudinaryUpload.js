export const uploadToCloudinary = async (file) => {
    if (!file) return null;

    const data = new FormData();
    data.append('file', {
        uri: file.uri,
        name: file.fileName || 'upload.jpg',
        type: file.mineType || 'image/jpeg',
    });
    data.append('upload_preset', 'jobhunter_unsigned');
    data.append("cloud_name", "dqbheiddg");

    try {
        const res = await fetch("https://api.cloudinary.com/v1_1/dqbheiddg/auto/upload", {
            method: "post",
            body: data,
        });

        const result = await res.json();

        if (result.secure_url) {
            return result.secure_url;
        } else {
            console.log("Cloudinary trả về lỗi:", result);
            return null;
        }
    } catch (error) {
        console.log("Upload failed:", error);
        return null;
    }
};