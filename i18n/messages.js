
const PROC_MESSAGES = {
    en: {
        'title': 'Procrastinator',
        'more-btn': 'NEXT',
        'add-btn': 'Add',
        'delete-btn': 'Delete',
        'reset-btn': 'Reset',
        'name-placeholder': 'Name (up to 10 chars)',
        'addr-placeholder': 'RSS address',
        'ok-btn': 'OK',

        'google-login': 'Log in via Google',
        'google-logout': 'Log out',
        'google-logout-confirm': 'Really log out?',

        'nothing-entry-title': 'I don\'t have more :(',
        'nothing-entry-html': '<center>Enable additional sources or come back later.</center>',

        'loading-entry-title': 'Loading...',

        'loading-failed-alert': 'Failed to load the "$1" source. Please, try again later',
        'google-init-failed-alert': 'Rejected by Google :( Logging in via Google won\'t work.',

        'welcome-entry-title': 'Hi, this is Procrastinator!',
        'welcome-entry-html':
            '<p>Procrastinator gathers news and articles from other resources and shows them one by one.' + 
            '<ul><li>Hit <b>&laquo;$1&raquo; or spacebar</b> to see the next article.</b></li> ' + 
            '<li>Hit <b>the article itself</b> to see the original.</li></ul></p>' +
            
            '<p>Procrastinator remembers articles you\'ve seen and doesn\'t show them again.</p>' +
            
            '<p>You can change information sources by hitting the top right gear icon.</p>' +
            
            '<p>There, you can also enable synchronization. With it, it\'s much more comfortable to use Procrastinator from different devices.</p>' +

            '<p>Please, leave feedback and suggestions <a href="$2" target="_blank">on GitHub</a>, ' +
            'or <a href="mailto:$3">mail me</a> directly.</p>',

        'no-name-alert': 'Please, enter a name',
        'name-too-long-alert': 'Please, make the name shorter',
        'name-exists-alert': 'This name is already used',
        'no-rss-addr-alert': 'Please, enter an RSS address',
        'rss-addr-exists-alert': 'This RSS address is already used for $1',
        'reset-confirm': 'Get back to the standard sites? All your changes will be lost.',
        'delete-confirm': 'Delete $1?',
    },
    
    ru: {
        'title': 'Прокрастинатор',
        'more-btn': 'ДАЛЬШЕ',
        'add-btn': 'Добавить',
        'delete-btn': 'Удалить',
        'reset-btn': 'Сбросить',
        'name-placeholder': 'Имя (до 10 знаков)',
        'addr-placeholder': 'Адрес RSS',
        'ok-btn': 'OK',

        'google-login': 'Войти через Google',
        'google-logout': 'Выйти',
        'google-logout-confirm': 'Правда выйти?',

        'nothing-entry-title': 'Больше ничего нет :(',
        'nothing-entry-html': '<center>Включите дополнительные ресурсы в настройках, или зайдите позже.</center>',

        'loading-entry-title': 'Загружаю...',

        'loading-failed-alert': 'Не удалось загрузить источник "$1". Может быть, получиться позднее?',
        'google-init-failed-alert': 'Google нас отверг :( Вход через Google не будет работать.',

        'welcome-entry-title': 'Привет, это Прокрастинатор!',
        'welcome-entry-html':
            '<p>Прокрастинатор собирает новости и статьи с других ресурсов и показывает вам по одной. ' + 
            '<ul><li>Нажмите <b>&laquo;$1&raquo; или пробел</b>, чтобы увидеть следующую статью.</li> ' + 
            '<li>Нажмите <b>на саму статью,</b> чтобы открыть оригинал.</li></ul></p>' +
            
            '<p>Прокрастинатор запоминает прочитанные статьи и не показывает их повторно.</p>' +
            
            '<p>Нажав на шестерёнку справа вверху, можно настроить, из каких источников брать информацию.</p>' +
            
            '<p>Там же можно подключить синхронизацию. С ней гораздо комфортнее использовать Прокрастинатор с разных устройств.</p>' +

            '<p>Пожелания и предложения можно оставлять <a href="$2" target="_blank">на GitHub</a>, ' +
            'либо писать мне на <a href="mailto:$3">почту</a>.</p>',

        'no-name-alert': 'Пожалуйста, введите имя',
        'name-too-long-alert': 'Пожалуйста, укоротите имя',
        'name-exists-alert': 'Это имя уже используется',
        'no-rss-addr-alert': 'Пожалуйста, введите адрес RSS',
        'rss-addr-exists-alert': 'Этот адрес уже используется для $1',
        'reset-confirm': 'Вернуться к стандартному набору сайтов? Все ваши изменения буду утеряны.',
        'delete-confirm': 'Удалить $1?',
    }
}
