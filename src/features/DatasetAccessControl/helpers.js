export function isValidOrgNo(value) {
   const regex = /^\d{9}$/;

   if (!regex.test(value)) {
      return false;
   }

   const orgNo = parseInt(value);
   const orgNoDigits = orgNo.toString().split('').map(digit => parseInt(digit));
   const weightDigits = [3, 2, 7, 6, 5, 4, 3, 2];
   let sum = 0;

   for (let i = 0; i < orgNoDigits.length - 1; i++) {
      sum += orgNoDigits[i] * weightDigits[i];
   }

   const rest = sum % 11;

   if (rest === 1) {
      return false;
   }

   const checkDigit = rest !== 0 ? 11 - rest : 0;
   const valid = checkDigit === orgNoDigits[orgNoDigits.length - 1];

   return valid;
}