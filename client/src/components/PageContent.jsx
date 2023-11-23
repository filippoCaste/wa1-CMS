import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { addNewBlock, decreasePosition, deleteContent, editContentValue, getAllPages, getAuthorInfo, getPageContent, getPublishedPages, increasePosition } from "../API";
import { Alert, Badge, Button, Col, Container, Form, Image, Row } from "react-bootstrap";
import { PageContent } from "./ContentView";

function PageInfo(props) {

    const { pageId } = useParams();
    const [author, setAuthor] = useState();
    const [contents, setContents] = useState([])
    const [errMsg, setErrMsg] = useState('')
    const [waiting, setWaiting] = useState(false)
    const [show, setShow] = useState(false)
    const page = props.pages.filter((p) => p.id == pageId)[0]
    const isTheAuthor = (author === props.user.email) || props.user.role === 'admin';
    const [view, setView] = useState(true)

    const navigate = useNavigate();

    useEffect(() => {
        getPageContent(pageId).then((result) => {
            setContents(result.sort((a, b) => a.level - b.level))
        })

        getAuthorInfo(page.authorID).then(a => {
            setAuthor(a)
        })
    }, [])

    const upPosition = async (contentId) => {
        // no upper than level 0
        if(contents.filter((c) => c.id === contentId)[0].level===0) {
            return ;
        }
        try {
            setWaiting(true);

            // call the API for increasing the position ('level')
            await increasePosition(contentId);
        } catch (error) {
            // console.log(error);
            setErrMsg(error.message);
            setShow(true);
            setWaiting(false);
        } finally {
            // update the value shown in the component
            const list = await getPageContent(pageId);
            setContents(() => list.sort((a, b) => a.level - b.level));
            setWaiting(false);
        }
    }

    const downPosition = async (contentId) => {
        try {
            setWaiting(true);
            await decreasePosition(contentId);
        } catch (error) {
            // console.log(error);
            setErrMsg(error.message);
            setShow(true);
            setWaiting(false);
        } finally {
            // update the value shown in the component
            const list = await getPageContent(pageId);
            setContents(() => list.sort((a, b) => a.level - b.level));
            setWaiting(false);
        }
    }

    const handleSave = async (contentId, value) => {
        try {
            setWaiting(true);
            await editContentValue(pageId, contentId, value);
        } catch (error) {
            setErrMsg(error.message);
            setShow(true);
            setWaiting(false);
        } finally {
            // update the value shown in the component
            const list = await getPageContent(pageId);
            setContents(list);
            setWaiting(false);
        }
    }

    const handleDelete = async (contentId) => {
        try {
            setWaiting(true);

            // VALIDATION: cannot be deleted if there are not anymore an header and another block
            let valid1 = false;
            let valid2 = false;

            let blocks = contents.filter(c => c.id !== contentId);

            for (let t of blocks) {
                if (t.type === 'header') {
                    valid1 = true
                } else {
                    valid2 = true;
                }
            }

            if (!(valid1 && valid2)) {
                setErrMsg("A page must contain at least 1 header and 1 other block (paragraph or image)")
                setShow(true)
                return;
            }

            await deleteContent(pageId, contentId)
        } catch (error) {
            setErrMsg(error.message);
            setShow(true);
            setWaiting(false);
        } finally {
            // update the value shown in the component
            const list = await getPageContent(pageId);
            setContents(list);
            setWaiting(false);
        }
    }

    const handleAdd = async (block, value) => {
        try {
            setWaiting(true);
            const new_val = {
                type: block,
                value: value
            }
            await addNewBlock(pageId, [new_val]);

        } catch (err) {
            setErrMsg(err.message);
            setShow(true);
            setWaiting(false);
        } finally {
            // update the value shown in the component
            const list = await getPageContent(pageId);
            setContents(list);
            setWaiting(false);
        }
    }

    const handleBack = () => {
        // in case of changes of other users
        if (props.frontOffice || !props.user.id) {
            getPublishedPages().then(result => {
                props.setPages(result)
                navigate('/')
            })
        } else {
            getAllPages().then((result) => {
                props.setPages(result)
                navigate('/')
            })
        }
    }

    return <>
        <Alert
            dismissible
            show={show}
            onClose={() => setShow(false)}
            variant="danger">
            {errMsg}
        </Alert>

        <PageData title={page.title} author={author} frontOffice={props.frontOffice} view={view} setView={setView} isTheAuthor={isTheAuthor} />
        <PageContent contents={contents} view={view} isTheAuthor={isTheAuthor} 
                upPosition={upPosition} downPosition={downPosition} 
                handleSave={handleSave} handleDelete={handleDelete}
                waiting={waiting} setWaiting={setWaiting} setErrMsg={setErrMsg} />

        <hr />
        {isTheAuthor && !view && <AddPageContent setWaiting={setWaiting} handleAdd={handleAdd} />}
        <Button variant='secondary' onClick={handleBack}>BACK</Button>
    </>

}

function PageData(props) {
    return <>
        <div className="text-end">
            <p>{props.title} created by: <Badge pill bg='secondary'>{props.author}</Badge></p>
            {props.isTheAuthor && <Button disabled={props.frontOffice} variant='warning' onClick={() => props.setView(!props.view)}>
                {props.view ? <i className="bi bi-pencil-square"></i> : <i className="bi bi-eye"></i>}
            </Button>}
        </div>
        <h1>{props.title}</h1>
    </>
}

function AddPageContent(props) {

    const [block, setBlock] = useState('header');
    const [image, setImage] = useState('dog.jpg');
    const [text, setText] = useState('');

    const handleAdd = () => {
        if (block === "image") {
            props.handleAdd(block, image);
            setBlock('header')
            setImage("dog.jpg");
        } else {
            if (text !== '') {
                props.handleAdd(block, text);
                setBlock('header')
                setText('')
            }
        }
    }

    return <Form>
        <Form.Text className="text-muted">
            This new block will be inserted at the bottom of the page. You can modify it later.
        </Form.Text>
        <Form.Group className="mb-3">
            <Form.Label>What do you want to add?</Form.Label>
            <Form.Select onChange={(ev) => setBlock(ev.target.value)}>
                <option value="header">Header</option>
                <option value='paragraph'>Paragraph</option>
                <option value='image'>Image</option>
            </Form.Select>
        </Form.Group>

        {block !== 'image' ? 
            <Form.Group className="mb-3" controlId="contentValue">
                <Form.Label>Insert here the text to be displayed</Form.Label>
                <Form.Control onChange={(ev) => setText(ev.target.value)} type="text" placeholder="How are you today?" />
            </Form.Group> : 
            
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
        <Button variant="primary" onClick={handleAdd}>ADD</Button>
    </Form>
}

export { PageInfo };