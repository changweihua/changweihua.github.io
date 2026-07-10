import { faker } from '@faker-js/faker' // 这里我使用了@faker-js/faker，也可以使用mockjs或者直接假数据
import { defineFakeRoute } from 'vite-plugin-fake-server';

export default defineFakeRoute( [
  {
    url: "/api/auth/login",
    method: "post",
    response(req) {
      // 支持参数，url参数是query，body参数放body，不懂的可以打印一下req
      const { username, password } = req.body;
      if (username === "admin" || password === "123456") {
        return {
          code: 200,
          data: faker.string.uuid(),
          msg: "登录成功",
        };
      } else {
        return {
          code: 400,
          msg: "帐号或密码错误",
        };
      }
    },
  },
  {
    url: "/api/auth/login",
    method: "post",
    response() {
      return {
        code: 200,
        msg: "退出成功",
      };
    },
  },
  {
    url: "/api/auth/userInfo",
    method: "get",
    response() {
      return {
        code: 200,
        data: {
          name: faker.person.fullName(),
          avatar: faker.image.avatar(),
          email: faker.internet.email(),
          phone: faker.phone.number(),
          address: faker.location.streetAddress(),
        },
      };
    },
  },
])
