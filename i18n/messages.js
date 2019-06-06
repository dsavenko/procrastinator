
const PROC_MESSAGES = {
    en: {
        'title': 'Procrastinator',
        'more-btn': 'NEXT',
        'check-again-btn': 'CHECK AGAIN',
        'add-btn': 'Add',
        'delete-btn': 'Delete',
        'reset-btn': 'Reset',
        'ok-btn': 'OK',
        'cancel-btn': 'Cancel',
        'unnamed-source-name': 'Unnamed',

        'name-placeholder': 'Name',
        'name-hint': 'unique, up to 20 chars',
        'addr-placeholder': 'Address',
        'addr-hint': 'Web address or RSS address',

        'google-login': 'Log in via Google',
        'google-logout': 'Log out',
        'google-logout-confirm': 'Really log out?',

        'nothing-entry-title': 'I don\'t have more :(',
        'nothing-entry-html': '<center>Enable additional sources or come back later.</center>',

        'loading-entry-title': 'Loading...',

        'loading-failed-alert': 'Failed to load $1. Maybe later?',
        'google-init-failed-alert': 'Rejected by Google :( Logging in via Google won\'t work.',

        'welcome-entry-title': 'Hi, this is Procrastinator!',
        'welcome-entry-html':
            '<p>Procrastinator gathers news and articles from other resources and shows them one by one.' + 
            '<ul><li>Hit <b>&laquo;$1&raquo; or spacebar</b> to see the next article.</b></li> ' + 
            '<li>Hit <b>the article itself (or Enter)</b> to see the original.</li></ul></p>' +
            
            '<p>Procrastinator remembers articles you\'ve seen and doesn\'t show them again.</p>' +
            
            '<p>You can change the sources of news and articles by hitting the top right gear icon.</p>' +
            
            '<p>There, you can also log in via Google. It\'ll help if you want to use Procrastinator from different devices.</p>' +

            '<p>Please, leave feedback and suggestions <a href="$2" target="_blank">on GitHub</a>, ' +
            'or <a href="mailto:$3">mail me</a> directly.</p>' + 
            
            '<p><center><b>Hit $1!</b></center></p>',

        'no-name-alert': 'Please, enter a name',
        'name-too-long-alert': 'Please, make the name shorter',
        'name-exists-alert': 'This name is already used',
        'no-rss-addr-alert': 'Please, enter an RSS address',
        'rss-addr-exists-alert': 'This RSS address is already used for $1',
        'reset-confirm': 'Set up sources from scratch? All your changes will be lost.',
        'delete-confirm': 'Delete $1?',

        'added-to-pocket-alert': 'Saved to Pocket',
        'failed-to-add-to-pocket-confirm': 'Failed to save to Pocket :( Try again?',

        'category-dialog-title': 'What would you like to read?',
        'category-dialog-nothing-chosen-alert': 'Please choose something',
        'category-general': 'Just news',
        'category-business': 'Business',
        'category-science': 'Science',
        'category-tech': 'Technology',
        'category-games': 'Games',
        'category-fun': 'Fun',
    },
    
    ru: {
        'title': 'Прокрастинатор',
        'more-btn': 'ДАЛЬШЕ',
        'check-again-btn': 'ПРОВЕРЬ СНОВА',
        'add-btn': 'Добавить',
        'delete-btn': 'Удалить',
        'reset-btn': 'Сбросить',
        'ok-btn': 'OK',
        'cancel-btn': 'Отмена',
        'unnamed-source-name': 'Без имени',

        'name-placeholder': 'Имя',
        'name-hint': 'уникальное, до 20 знаков',
        'addr-placeholder': 'Адрес',
        'addr-hint': 'адрес сайта (или адрес RSS)',

        'google-login': 'Войти через Google',
        'google-logout': 'Выйти',
        'google-logout-confirm': 'Правда выйти?',

        'nothing-entry-title': 'Больше ничего нет :(',
        'nothing-entry-html': '<center>Включите дополнительные ресурсы в настройках, или зайдите позже.</center>',

        'loading-entry-title': 'Загружаю...',

        'loading-failed-alert': 'Не удалось загрузить $1. Может быть, получится позднее?',
        'google-init-failed-alert': 'Google нас отверг :( Вход через Google не будет работать.',

        'welcome-entry-title': 'Привет, это Прокрастинатор!',
        'welcome-entry-html':
            '<p>Прокрастинатор собирает новости и статьи с других ресурсов и показывает вам по одной. ' + 
            '<ul><li>Нажмите <b>&laquo;$1&raquo; или пробел</b>, чтобы увидеть следующую статью.</li> ' + 
            '<li>Нажмите <b>на саму статью (или Enter),</b> чтобы открыть оригинал.</li></ul></p>' +
            
            '<p>Прокрастинатор запоминает прочитанные статьи и не показывает их повторно.</p>' +
            
            '<p>Нажав на шестерёнку справа вверху, можно настроить, откуда брать новости и статьи.</p>' +
            
            '<p>Там же можно войти через Google. Это полезно, если вы хотите использовать Прокрастинатор с разных устройств.</p>' +

            '<p>Пожелания и предложения можно оставлять <a href="$2" target="_blank">на GitHub</a>, ' +
            'либо писать мне на <a href="mailto:$3">почту</a>.</p>' + 
            
            '<p><center><b>Нажмите $1!</b></center></p>',

        'no-name-alert': 'Пожалуйста, введите имя',
        'name-too-long-alert': 'Пожалуйста, укоротите имя',
        'name-exists-alert': 'Это имя уже используется',
        'no-rss-addr-alert': 'Пожалуйста, введите адрес RSS',
        'rss-addr-exists-alert': 'Этот адрес уже используется для $1',
        'reset-confirm': 'Перенастроить источники? Все ваши изменения буду утеряны.',
        'delete-confirm': 'Удалить $1?',

        'added-to-pocket-alert': 'Сохранил в Pocket',
        'failed-to-add-to-pocket-confirm': 'Не смог сохранить в Pocket :( Попробовать снова?',

        'category-dialog-title': 'Что бы вы хотели почитать?',
        'category-dialog-nothing-chosen-alert': 'Пожалуйста, выберите что-нибудь',
        'category-general': 'Просто новости',
        'category-business': 'Бизнес',
        'category-science': 'Наука',
        'category-tech': 'Технология',
        'category-games': 'Игры',
        'category-fun': 'Развлекательное',
    }
}
