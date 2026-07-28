let user;
export default function () {
  this.getUser = () => user;
  this.connect = function () {
    try {
      user = JSON.parse(document.getElementById('user').value);
    } catch (e) {
      user = null;
    }
    console.log('CONNECT USER', user);
    if (!user) return null;
    return io.connect(window.location.origin,
      {
        query: { user: JSON.stringify(user) },
      });
  };
}
