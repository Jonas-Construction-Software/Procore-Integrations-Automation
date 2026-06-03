export default class Mocker {

    static getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;

    }

    static getRandomWord(length) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
        }
        return result;

    }
    static getCurrentDateTime(days = 0) {
        const dateNow = new Date();
        const options = {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"

        };
        return new Date(dateNow.setDate(dateNow.getDate() + days)).toLocaleDateString('en-US', options);

    }
    static getDate(days) {
        const dateNow = new Date();
        const options = {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        };
        return new Date(dateNow.setDate(dateNow.getDate() + days)).toLocaleDateString('en-US', options);
    }
    static getCurrentMonthName() {

        const months = [

            "January", "February", "March", "April", "May", "June",

            "July", "August", "September", "October", "November", "December"

        ];

        const currentDate = new Date();
        const currentMonthIndex = currentDate.getMonth();
        return months[currentMonthIndex];

    }

}
