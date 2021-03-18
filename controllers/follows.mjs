export default function initFollowsController(app, pool) {

  const create = async (request, response) => {
    try{
      const newRelationArr = [request.cookies.userId, request.body.followed];
      await pool.query(`INSERT INTO follows (follower_id, followed_id) VALUES ($1, $2)`, newRelationArr)
      response.redirect(`/dogs/profile/${newRelationArr[1]}`);
    } catch (error) {
      console.log(error);
    }
  }

  const del = async (request, response) => {
    try {
      const cutTiesArr = [request.cookies.userId, request.body.followed];
      await pool.query(`DELETE FROM follows WHERE (follower_id=$1 AND followed_id=$2)`, cutTiesArr);
      response.redirect(`/dogs/profile/${cutTiesArr[1]}`);
    } catch (error) {
      console.log(error);
    }
  }

  return {
    create,
    del
  }
}