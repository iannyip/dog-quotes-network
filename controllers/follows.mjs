export default function initFollowsController(app, pool) {

  const create = (request, response) => {
    const newRelationArr = [request.cookies.userId, request.body.followed];
    pool
      .query(
        `INSERT INTO follows (follower_id, followed_id) VALUES ($1, $2)`,
        newRelationArr
      )
      .then((result) => {
        response.redirect(`/dogs/profile/${newRelationArr[1]}`);
      })
      .catch((error) => console.log(error));
  }

  const del = (request, response) => {
    const cutTiesArr = [request.cookies.userId, request.body.followed];
    pool
      .query(
        `DELETE FROM follows WHERE (follower_id=$1 AND followed_id=$2)`,
        cutTiesArr
      )
      .then((result) => {
        response.redirect(`/dogs/profile/${cutTiesArr[1]}`);
      })
      .catch((error) => console.log(error));
  }


  return {
    create,
    del
  }
}