# Stage 1

Первое задание по легенде представляет собой место встречи для получения кода запуска ракет.

http://vic.cupctf.ru Vladivostok Internation Center представляет собой сайт с формой входа.

В ответе сервера содержится cookie, в этой куке зашифрованна(base64) информация 
Personal=KGxvZ2luOkFuZHJleUphbWVzQm90OnBhc3M6MTMzNzE3MDk6d2VsY29tZV90b19WbGFkaXZvc3Rvayk%3D
(login:AndreyJamesBot:pass:13371709:welcome_to_Vladivostok)

Логин AndreyJamesBot pass 13371709 авторизируемся, получаем ключ
"Доброго времени, Mr.Petrov, код запуска 8378190384, надеюсь наше сотрудничество будет плодотворным!"

Затем в телеграмме находим бота @AndreyJamesBot и отдаем ключ 8378190384. Получаем флаг.