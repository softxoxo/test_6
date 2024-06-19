## Создание .env файла
Роль 1 - у всех есть доступ к запросам, доступным только для администраторов. Для проверки доступа сменить значение на любое другое.

```
ROLE_ADMIN=1
JWT_SECRET=test
```

## Установка и запуск

1. Клонируйте репозиторий:

```
git clone https://github.com/softxoxo/test_6.git
```

2. Перейдите в директорию проекта:

```
cd test_6
```

4. Установите зависимости:

```
npm install
```

4. Запустите сервер:

```
npm run start
```

## Конфигурация таблиц в PostgreSQL

```
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  publication_date DATE,
  genres VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (username, password, email, role)
VALUES
  ('admin', '$2b$10$your_hashed_password', 'admin@example.com', 4),
  ('user1', '$2b$10$your_hashed_password', 'user1@example.com', 1);

INSERT INTO books (title, author, publication_date, genres)
VALUES
  ('Book 1', 'Author 1', '2022-01-01', 'Fantasy, Adventure'),
  ('Book 2', 'Author 2', '2023-03-15', 'Science Fiction');
```

## Примеры запросов в Insomnia

1. Зарегистрировать нового пользователя:

- Метод: `POST`
- URL: `http://localhost:3000/users/register`
- Тело запроса:
  ```json
  {
    "username": "newuser",
    "password": "password123",
    "email": "newuser@example.com"
  }
  ```

2. Войти в аккаунт:

- Метод: `POST`
- URL: `http://localhost:3000/users/login`
- Тело запроса:
  ```json
  {
    "username": "newuser",
    "password": "password123"
  }
  ```

3. Получить информацию о пользователе:

- Метод: `GET`
- URL: `http://localhost:3000/users/me`
- Headers: <JWT token>

4. Добавить новую книгу (нужны права администратора):

- Метод: `POST`
- URL: `http://localhost:3000/books`
- Тело запроса:
  ```json
  {
    "title": "New Book",
    "author": "New Author",
    "publicationDate": "2023-06-01",
    "genres": "Fiction, Mystery"
  }
  ```

5. Получить список книг:

- Метод: `GET`
- URL: `http://localhost:3000/books`

6. Получить конкретную книгу:

- Метод: `GET`
- URL: `http://localhost:3000/books/:id`

7. Обновить информацию о книге (нужны права администратора):

- Метод: `PUT`
- URL: `http://localhost:3000/books/:id`
- Headers: <JWT token>
- Тело запроса:
  ```json
  {
    "title": "Updated Book",
    "author": "Updated Author",
    "publicationDate": "2023-06-02",
    "genres": "Fiction, Thriller"
  }
  ```

8. Удалить книгу:

- Метод: `DELETE`
- URL: `http://localhost:3000/books/:id`
- Headers: <JWT token>

9. Обновить роль пользователя (нужны права администратора):

- Метод: `PUT`
- URL: `http://localhost:3000/users/:id/role`
- Headers: <JWT token>
- Тело запроса:
  ```json
  {
    "role": 4
  }
  ```