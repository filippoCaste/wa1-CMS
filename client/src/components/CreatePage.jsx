import { Alert, Button, Col, Container, Form, Image, Row } from "react-bootstrap"
import { addNewPage, getAllPages } from "../API";
import { useNavigate } from "react-router";
import { useState } from "react";
import dayjs from "dayjs";
import { PageContent } from "./ContentView";

function CreatePage (props) {

    const navigate = useNavigate();

    const [title, setTitle] = useState('')
    const [publicationDate, setPublicationDate] = useState(undefined)
    const [show, setShow] = useState(false)
    const [errMsg, setErrMsg] = useState('')

    const [blocks, setBlocks] = useState([])
    const [success, setSuccess] = useState(false);
    const [fakeId, setFakeId] = useState(0)

    const addBlock = (type, value) => {
        if(value !== '') {
            // it's fakeId. Then database will assign one properly
            setBlocks([...blocks, {id: fakeId, type: type, value: value, level: fakeId}]);
            setSuccess(true);
            setFakeId(fakeId+1);
        }
    }

    const upPosition = (contentId) => {
        setBlocks(blocks.map( b => {
            if(b.id === contentId && b.level>0) {
                return {...b, level: b.level-1}
            } else {
                return b;
            }
        }))
    }

    const downPosition = (contentId) => {
        setBlocks(blocks.map(b => {
            if (b.id === contentId) {
                return { ...b, level: b.level + 1 }
            } else {
                return b;
            }
        }))
    }

    const handleSave = (contentId, value) => {
        setBlocks(blocks.map(b => {
            if(b.id === contentId) {
                return {...b, value: value };
            } else {
                return b;
            }
        }))
    }

    const handleDelete = (contentId) => {
        setBlocks(blocks.filter( b => b.id !== contentId))
    }

    const handleAdd = () => {
        let valid1 = false;
        let valid2 = false;

        for(let t of blocks) {
            if (t.type==='header') {
                valid1 = true
            } else {
                valid2 = true;
            }
        }

        if(! (valid1 && valid2) ) {
            setErrMsg("A new page must be created with at least 1 header and 1 other block (paragraph or image)")
            setShow(true)
            return ;
        }

        if(title === '') {
            setErrMsg("Title is required")
            setShow(true)
            return ;
        }

        publicationDate && setPublicationDate(dayjs(publicationDate).format("YYYY-MM-DD"))

        addNewPage(title, publicationDate, blocks)
            .then(() => {
                getAllPages().then((result) => {
                    props.setPages(result)
                    navigate('/')
                })
            })
            .catch((err) => { setShow(true); setErrMsg(err.message) })
    }

    const handleCancel = () => {
        navigate('/');
    }

    return <>
        <Alert
            dismissible
            show={show}
            onClose={() => setShow(false)}
            variant="danger">
            {errMsg}
        </Alert>

        <Form>
            <Form.Group required controlId="pageTitle">
                <Form.Label className='fw-light'>Title</Form.Label>
                <Form.Control onChange={(ev) => { setTitle(ev.target.value) }} type="text" name="text" placeholder="Enter title" />
                <Form.Control.Feedback type="invalid">
                    Please choose a title.
                </Form.Control.Feedback>
            </Form.Group>

            <Form.Group controlId="pageDate">
                <Form.Label className='fw-light'>Date</Form.Label>
                <Form.Control onChange={(ev) => { setPublicationDate(dayjs(ev.target.value).format("YYYY-MM-DD")) }} type="date" name="date" min={dayjs().format('YYYY-MM-DD')} />
            </Form.Group>

            <hr />
            <Alert
                dismissible
                show={success}
                onClose={() => setSuccess(false)}
                variant="success">
                The block has been added to the page!
            </Alert>

            <AddPageContent addBlock={addBlock}/>

            <hr />

            <PageContent contents={blocks.sort((a, b) => a.level - b.level)} isTheAuthor={true} view={false} 
                upPosition={upPosition} downPosition={downPosition}
                handleSave={handleSave} handleDelete={handleDelete}
                waiting={false}
            />

            <hr />

            <Button variant='primary' onClick={handleAdd}>SAVE</Button>{' '}
            <Button variant='secondary' onClick={handleCancel}>CANCEL</Button>

        </Form>

    </>
}

function AddPageContent(props) {

    const [type, setType] = useState('header');
    const [image, setImage] = useState('dog.jpg');
    const [text, setText] = useState('');

    const addBlock = () => {
        if (type === "image") {
            props.addBlock(type, image);
        } else {
            if (text !== '') {
                props.addBlock(type, text);
                setText('')
            }
        }
    }

    return <>
        <Form.Text className="text-muted">
            This new block will be inserted at the bottom of the page. You can modify it later.
        </Form.Text>
        
        <Form.Group className="mb-3">
            <Form.Label>What do you want to add?</Form.Label>
            <Form.Select onChange={(ev) => setType(ev.target.value)}>
                <option value="header">Header</option>
                <option value='paragraph'>Paragraph</option>
                <option value='image'>Image</option>
            </Form.Select>
        </Form.Group>

        {type !== 'image' ?
            <Form.Group className="mb-3" controlId="contentValue">
                <Form.Label>Insert here the text to be displayed</Form.Label>
                <Form.Control onChange={(ev) => setText(ev.target.value)} type="text" value={text} placeholder="How are you today?" />
            </Form.Group>  :
            <Container>
                <Row>
                    <Col xs={6} md={6}>
                        <Image className="resized-image" src="http://localhost:3000/dog.jpg" rounded />
                        <p>1</p>
                    </Col>
                    <Col xs={6} md={6}>
                        <Image className="resized-image" src="http://localhost:3000/cat.jpeg" rounded />
                        <p>2</p>
                    </Col>
                </Row>
                <Row>
                    <Col xs={6} md={6}>
                        <Image className="resized-image" src="http://localhost:3000/nodog_nocat.jpg" rounded />
                        <p>3</p>
                    </Col>
                    <Col xs={6} md={6}>
                        <Image className="resized-image" src="http://localhost:3000/postcard.jpg" rounded />
                        <p>4</p>
                    </Col>
                </Row>
                <Form.Group className="mb-3">
                    <Form.Label>Which image do you want to insert?</Form.Label>
                    <Form.Select onChange={(ev) => setImage(ev.target.value)}>
                        <option value="dog.jpg">1</option>
                        <option value='cat.jpeg'>2</option>
                        <option value='nodog_nocat.jpg'>3</option>
                        <option value='postcard.jpg'>4</option>
                    </Form.Select>
                </Form.Group>
            </Container>
        }
        <Button variant="primary" onClick={addBlock}>ADD BLOCK</Button>
    </>
}

export {CreatePage}