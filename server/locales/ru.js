// @ts-check

module.exports = {
  translation: {
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
        accessError: 'Вы не можете редактировать или удалять другого пользователя',
        create: {
          error: 'Не удалось зарегистрировать',
          success: 'Пользователь успешно зарегистрирован',
        },
        update: {
          error: 'Не удалось обновить пользователя',
          success: 'Пользователь успешно изменён',
        },
        delete: {
          error: 'Не удалось удалить пользователя',
          relateError: 'Не удалось удалить пользователя, есть связанные задачи',
          success: 'Пользователь успешно удалён',
        },
      },
      statuses: {
        create: {
          error: 'Не удалось создать статус',
          success: 'Статус успешно создан',
        },
        update: {
          error: 'Не удалось обновить статус',
          success: 'Статус успешно изменён',
        },
        delete: {
          error: 'Не удалось удалить статус',
          relateError: 'Не удалось удалить статус, есть связанные задачи',
          success: 'Статус успешно удалён',
        },
      },
      labels: {
        create: {
          error: 'Не удалось создать метку',
          success: 'Метка успешно создана',
        },
        update: {
          error: 'Не удалось обновить метку',
          success: 'Метка успешно изменена',
        },
        delete: {
          error: 'Не удалось удалить метку',
          relateError: 'Не удалось удалить метку, есть связанные задачи',
          success: 'Метка успешно удалена',
        },
      },
      tasks: {
        accessError: 'Задачу может удалить только её автор.',
        create: {
          error: 'Не удалось создать задачу',
          success: 'Задача успешно создана',
        },
        update: {
          error: 'Не удалось обновить задачу',
          success: 'Задача успешно изменена',
        },
        delete: {
          error: 'Не удалось удалить задачу',
          creatorError: 'Задачу может удалить только её автор',
          success: 'Задача успешно удалена',
        },
      },
      authError: 'Доступ запрещён! Пожалуйста, авторизируйтесь.',
      serverError: 'Ошибка сервера',
    },
    layouts: {
      application: {
        title: 'Менеджер задач',
        users: 'Пользователи',
        statuses: 'Статусы',
        tasks: 'Задачи',
        labels: 'Метки',
        signIn: 'Вход',
        signUp: 'Регистрация',
        signOut: 'Выход',
      },
    },
    views: {
      session: {
        new: {
          title: 'Вход',
          email: 'Email',
          password: 'Пароль',
          submit: 'Войти',
        },
      },
      users: {
        index: {
          id: 'ID',
          fullName: 'Полное имя',
          email: 'Email',
          creator: 'Создатель',
          executor: 'Исполнитель',
          createdAt: 'Дата создания',
          delete: 'Удалить',
          edit: 'Изменить',
        },
        new: {
          title: 'Регистрация',
          firstName: 'Имя',
          lastName: 'Фамилия',
          email: 'Email',
          password: 'Пароль',
          submit: 'Сохранить',
        },
        edit: {
          title: 'Изменение пользователя',
          firstName: 'Имя',
          lastName: 'Фамилия',
          email: 'Email',
          password: 'Пароль',
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
        index: {
          id: 'ID',
          name: 'Наименование',
          tasks: 'Задачи',
          createdAt: 'Дата создания',
          create: 'Создать статус',
          delete: 'Удалить',
          edit: 'Изменить',
        },
        new: {
          title: 'Создание статуса',
          name: 'Наименование',
          submit: 'Создать',
        },
        edit: {
          title: 'Изменение статуса',
          name: 'Наименование',
          submit: 'Изменить',
        },
      },
      labels: {
        index: {
          id: 'ID',
          name: 'Наименование',
          tasks: 'Задачи',
          createdAt: 'Дата создания',
          create: 'Создать метку',
          delete: 'Удалить',
          edit: 'Изменить',
        },
        new: {
          title: 'Создание метки',
          name: 'Наименование',
          submit: 'Создать',
        },
        edit: {
          title: 'Изменение метки',
          name: 'Наименование',
          submit: 'Изменить',
        },
      },
      tasks: {
        index: {
          id: 'ID',
          name: 'Наименование',
          status: 'Статус',
          labels: 'Метки',
          creator: 'Автор',
          executor: 'Исполнитель',
          createdAt: 'Дата создания',
          create: 'Создать задачу',
          delete: 'Удалить',
          edit: 'Изменить',
          filter: {
            status: 'Статус',
            executor: 'Исполнитель',
            label: 'Метка',
            checkbox: 'Только мои задачи',
            submit: 'Показать',
          },
        },
        new: {
          title: 'Создание задачи',
          name: 'Наименование',
          description: 'Описание',
          status: 'Статус',
          executor: 'Исполнитель',
          labels: 'Метки',
          submit: 'Создать',
        },
        edit: {
          title: 'Изменение задачи',
          name: 'Наименование',
          description: 'Описание',
          status: 'Статус',
          executor: 'Исполнитель',
          labels: 'Метки',
          submit: 'Изменить',
        },
        one: {
          creator: 'Автор',
          executor: 'Исполнитель',
          status: 'Статус',
          createdAt: 'Дата создания',
          labels: 'Метки',
          edit: 'Изменить',
          delete: 'Удалить',
        },
      },
    },
  },
};
