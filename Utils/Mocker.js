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
    static getCurrentDateTimeSpecificFormatInTexas() {
        const currentDate = new Date();
        const texasTime = new Date(currentDate.toLocaleString("en-US", { timeZone: "America/Chicago" }));
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: true // Use 12-hour format
        };
        let formattedDate = texasTime.toLocaleString("en-US", options);
        formattedDate = formattedDate.replace(' at ', ', ');
        return formattedDate;
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
    static generateRandomAPNNumber() {
        const getRandomDigit = () => Math.floor(Math.random() * 10);
        const getRandomDigitExceptZero = () => Math.floor(Math.random() * 9) + 1;
        const randomNumber = (length, separator) => {
            let number = '';
            for (let i = 0; i < length; i++) {
                if (i === 5 || i === 8 || i === 11) {
                    number += separator;
                } else {
                    if (i === 0) {
                        number += getRandomDigitExceptZero();
                    } else {
                        number += getRandomDigit();
                    }
                }
            }

            return number;
        };

        return randomNumber(14, '-');

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
    static getCurrentDateTimeInTexas(days = 0) {
        const dateNow = new Date();
        dateNow.setDate(dateNow.getDate() + days);
        const options = {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "numeric",
            hour12: true,
            timeZone: "America/Chicago"

        };

        let formattedDate = dateNow.toLocaleString('en-US', options);
        formattedDate = formattedDate.replace(/(AM|PM)/, "").trim();
        return formattedDate;

    }

    static getCurrentTimeInTexas() {
        const options = {
            timeZone: 'America/Chicago',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true

        };

        const formatter = new Intl.DateTimeFormat('en-US', options);
        return formatter.format(new Date());

    }

}
