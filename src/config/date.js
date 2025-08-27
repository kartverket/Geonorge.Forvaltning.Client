import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import arraySupport from "dayjs/plugin/arraySupport";
import nb from "date-fns/locale/nb";
import { registerLocale } from "react-datepicker";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(arraySupport);

registerLocale("nb", nb);

export const getTimeZone = () => dayjs.tz.guess();
