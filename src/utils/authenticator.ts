export const tokenAuthenticator = (request: any) => {
  if (!request.user) throw Error("존재하지 않는 유저");
  return;
};
