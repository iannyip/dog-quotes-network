// db is an argument to this function so
// that we can make db queries inside
export default function initQuotesController(app, pool) {
  const create = (request, response) => {
    const newQuoteData = request.body;
    const { userId } = request.cookies;
    pool
      .query(
        `INSERT INTO quotes (quote, quoter_id) VALUES ('${
          newQuoteData.quote
        }', ${Number(userId)})`
      )
      .then((result) => response.redirect("/feed"))
      .catch((error) => console.log(error));
  }

  const showEdit = (request, response) => {
    const { id } = request.params;
    pool
      .query(`SELECT * FROM quotes WHERE id=${id}`)
      .then((result) => {
        response.render("./quotes/quote-edit", result.rows[0]);
      })
      .catch((error) => console.log(error));
  }

  const update = (request, response) => {
    const { id } = request.params;
    pool
      .query(`UPDATE quotes SET quote='${request.body.quote}' WHERE id=${id}`)
      .then((result) => response.redirect("/dogs/you"))
      .catch((error) => console.log(error));
  }

  const del = (request, response) => {
    const { id } = request.params;
    pool
      .query(`DELETE FROM quotes WHERE id=${id}`)
      .then((result) => response.redirect("/dogs/you"))
      .catch((error) => console.log(error));
  }
  
  // return all methods we define in an object
  // refer to the routes file above to see this used
  return {
    create,
    showEdit,
    update,
    del
  };
}