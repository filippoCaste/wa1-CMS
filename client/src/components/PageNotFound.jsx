// import { Jumbotron } from "react-bootstrap";
import { Alert } from "react-bootstrap";
import { Link } from "react-router-dom";

function PageNotFound() {

    return <Alert variant='danger'>
        <h1>Page not found...</h1>
        <p>Please go back to the <Link to='/'>home page</Link>.</p>
    </Alert>
}

export { PageNotFound };