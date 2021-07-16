// @ts-check

module.exports = {
  translation: {
    appName: 'Менеджер задач',
    btns: {
      submit: 'Отправить',
      delete: 'Удалить',
      edit: 'Изменить',
      save: 'Сохранить',
    },
    flash: {
      session: {
        create: {
          success: 'Вы залогинены',
          error: 'Неправильный емейл или пароль',
        },
        delete: {
          success: 'Вы разлогинены',
        },
      },
      users: {
        create: {
          error: 'Не удалось зарегистрировать',
          success: 'Пользователь успешно зарегистрирован',
        },
      },
      statuses: {
        create: {
          error: 'Не удалось создать статус',
          success: 'Статус успешно зарегистрирован',
        },
        update: {
          error: 'Не удалось обновить статус',
          success: 'Статус успешно обновлен',
        },
        delete: {
          error: 'Не удалось удалить статус',
          success: 'Статус успешно удален',
        },
      },
      tasks: {
        create: {
          error: 'Не удалось создать задачу',
          success: 'Статус успешно зарегистрирован',
        },
      },
      authError: 'Доступ запрещён! Пожалуйста, авторизируйтесь.',
      serverError: 'Ошибка сервера',
    },
    layouts: {
      application: {
        users: 'Пользователи',
        statuses: 'Статусы',
        tasks: 'Задачи',
        signIn: 'Вход',
        signUp: 'Регистрация',
        signOut: 'Выход',
      },
    },
    views: {
      session: {
        new: {
          signIn: 'Вход',
          submit: 'Войти',
        },
      },
      users: {
        id: 'ID',
        fullName: 'Полное имя',
        firstName: 'Имя',
        secondName: 'Фамилия',
        password: 'Пароль',
        email: 'Email',
        createdAt: 'Дата создания',
        new: {
          newUser: 'Регистрация',
          submit: 'Сохранить',
        },
        edit: {
          editUser: 'Изменение пользователя',
          submit: 'Изменить',
        },
      },
      welcome: {
        index: {
          hello: 'Привет от Хекслета!',
          description: 'Практические курсы по программированию',
          more: 'Узнать Больше',
        },
      },
      statuses: {
        id: 'ID',
        name: 'Наименование',
        createdAt: 'Дата создания',
      },
    },
  },
};
