import { Controller, Post, Body } from "@nestjs/common";

@Controller()
export default class EchoController {

  @Post('/echo')
  public async echo (@Body() body) {
    return body;
  }
}