module.exports = function (ws, web) {
  return async function requestUsersController(message) {

    try {
      const query = {
        limit: 100,
        offset: message.payload.offset,
      };

      let users;
      try {
        users = await web.users.list(query);
      } catch(e) {
        console.log('users.list', e);
      }

      ws.send(
        JSON.stringify({
          event: 'usersBatch',
          payload: {
            members: users.members.filter(user => !!user.tz).map(user => ({
              tz: user.tz,
            })),
            offset: users.offset,
          },
        })
      );
    } catch (e) {
      console.log(e);

      ws.send(
        JSON.stringify({
          event: 'unauthorized',
        })
      );
    }
  };
};
