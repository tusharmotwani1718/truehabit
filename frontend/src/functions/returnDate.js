export default function returnDate(date) {
    const dateObj = new Date(date);
    let day = dateObj.getDate();
    let month = dateObj.getMonth() + 1;
    let year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
}