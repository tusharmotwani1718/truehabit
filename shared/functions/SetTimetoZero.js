export default function SetTimetoZero(date) {
    return new Date(date).setHours(0, 0, 0, 0)
}