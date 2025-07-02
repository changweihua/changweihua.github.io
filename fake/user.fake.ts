// fake/user.fake.ts
import { faker } from "@faker-js/faker";
// import Mock from "mockjs";
import { defineFakeRoute } from "vite-plugin-fake-server/client";

export default defineFakeRoute([
  // {
  //   url: "/mock/get-user-info",
  //   response: () => {
  //     return Mock.mock({
  //       id: "@guid",
  //       username: "@first",
  //       email: "@email",
  //       avatar: '@image("200x200")',
  //       role: "admin",
  //     });
  //   },
  // },
  {
    url: "/fake/get-user-info",
    response: () => {
      return {
        id: faker.string.uuid(),
        avatar: faker.image.avatar(),
        birthday: faker.date.birthdate(),
        email: faker.internet.email(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        sex: faker.person.sexType(),
        role: "admin",
      };
    },
  },
]);
