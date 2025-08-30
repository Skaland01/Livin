import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import isoWeek from 'dayjs/plugin/isoWeek';
import localeData from 'dayjs/plugin/localeData';

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isoWeek);
dayjs.extend(localeData);

// Set default timezone to Europe/Oslo
dayjs.tz.setDefault('Europe/Oslo');

// Set Monday as the start of the week
dayjs.Ls.en.weekStart = 1;

export default dayjs;
