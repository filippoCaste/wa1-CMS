import { useState } from "react";
import { Alert, Button, Col, Form, InputGroup, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function LoginForm(props) {

    const [username, setUsername] = useState('') ;
    const [password, setPassword] = useState('') ;
    const [errMsg, setErrMsg] = useState('') ;
    const [show, setShow] = useState(false)

    const [validated, setValidated] = useState(false);

    const navigate = useNavigate() ;

    const handleSubmit = (event) => {
        event.preventDefault();

        if (username.match(/^[\w\-\.]+@([\w-]+\.)+[\w-]{2,}$/)) {
            setValidated(true);
        }

        props.handleLogin(username, password)
            .then(() => navigate("/"))
            .catch((err) => {
                setErrMsg(err.message); 
                setShow(true);
                setValidated(false);
            });
    };

    return <>
        <Row className="justify-content-center align-items-center" >
            <Col xs={12} md={6}>
                <Form onSubmit={handleSubmit} validated={validated} >
                    <Alert
                        dismissible
                        show={show}
                        onClose={() => setShow(false)}
                        variant="danger">
                        {errMsg}
                    </Alert>
                    <Form.Group className="mb-3" controlId="username">
                        <Form.Label>Email</Form.Label>
                        <InputGroup hasValidation>
                            <Form.Control
                                type="email"
                                value={username} 
                                placeholder="Email"
                                onChange={(ev) => setUsername(ev.target.value)}
                                required
                            />
                        </InputGroup>

                    </Form.Group>
                    <Form.Group className="mb-3" controlId="password">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            value={password} placeholder="Password"
                            onChange={(ev) => setPassword(ev.target.value)}
                            required
                        />
                    </Form.Group>

                    <Button variant="success" type="submit">Login</Button>{'  '}
                    <Button variant="secondary" type="button" onClick={() => { navigate('/') }}>Cancel</Button>

                </Form>
            </Col>
        </Row>
    </>
}

export { LoginForm } ;