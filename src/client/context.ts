export default ctx => {
  if (ctx.req) {
    const protocol = ctx.req.protocol;
    const host = ctx.req.headers.host;

    const baseUrl = `${protocol}://${host}`;

    ctx.state.baseUrl = baseUrl;
  }

}

export function state() {
  return {
    baseUrl: '',
  }
}