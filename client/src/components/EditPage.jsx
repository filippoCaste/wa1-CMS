import { useEffect, useState } from "react";
import { Alert, Button, Form } from "react-bootstrap"
import { useNavigate, useParams } from "react-router"
import { Link } from "react-router-dom";
import dayjs from 'dayjs'
import { editPageInfo, editPageInfoAdmin, getAllEmails, getAllPages, getAuthorInfo } from "../API";

function EditPage (props) {

    const {pageId} = useParams();
    const page = props.pages.filter(p => p.id == pageId)[0];
    const user = props.user;
    const navigate = useNavigate();

    const [title, setTitle] = useState(page.title)
    const [author, setAuthor] = useState(user.email)
    const [publicationDate, setPublicationDate] = useState(page.publicationDate && dayjs(page.publicationDate).format("YYYY-MM-DD") || 'NULL')
    const [isAdmin, setIsAdmin] = useState(user.role === 'admin')
    const [show, setShow] = useState(false)
    const [errMsg, setErrMsg] = useState('')
    const [authors, setAuthors] = useState([])
    const [selected, setSelected] = useState('')

    useEffect(() => {
        if(isAdmin) {
            getAllEmails()
                .then((res) => {setAuthors(res)})
                .catch((err) => { setShow(true); setErrMsg(err.message) })

            getAuthorInfo(page.authorID).then(a => {
                setAuthor(a)
                setSelected(a)
            })
        }
    }, [])

    const handleSave = () => {
        let tt = undefined;
        if(title !== page.title) {
            tt = title;
        }

        if(isAdmin) {
            // change ownership await
            editPageInfoAdmin(pageId, publicationDate, tt, selected)
                .then(() => {
                    getAllPages().then((result) => {
                        props.setPages(result)
                        navigate('/')
                    })
                })
                .catch((err) => { setShow(true); setErrMsg(err.message) })
        } else {
            editPageInfo(pageId, publicationDate, tt)
                .then(() => {
                    getAllPages().then((result) => {
                        props.setPages(result)
                        navigate('/')
                    })
                })
                .catch((err) => {setShow(true); setErrMsg(err.message)})
            }
    }

    const handleCancel = () => {
        // in case of changes of other users
        getAllPages().then((result) => {
            props.setPages(result)
            navigate('/')
        })
    }

    return <>
        <Alert variant='info' dismissible>
            Do you want to modify the content of the page instead? <br /> Go <Link to={`/pages/${pageId}`}>here</Link>!
        </Alert>
        <Alert
            dismissible
            show={show}
            onClose={() => setShow(false)}
            variant="danger">
            {errMsg}
        </Alert>

        <Form>
            <Form.Group controlId="pageTitle">
                <Form.Label className='fw-light'>Title</Form.Label>
                <Form.Control value={title} onChange={(ev) => { setTitle(ev.target.value) }} type="text" name="text" placeholder="Enter title" />
            </Form.Group>

{/* ADMIN */}
            <Form.Group controlId="pageAuthor">
                <Form.Label className='fw-light'>Author</Form.Label>
                <Form.Select disabled={!isAdmin} placeholder="Author" onChange={(ev) => setSelected(ev.target.value)}>
                    <option default>Choose author</option>
                    {authors.map((a) => {
                        return <option key={a} value={a}> {a} </option>
                    })}
                </Form.Select>
            </Form.Group>

            <hr />
            <Form.Text className="text-muted">
                Keep in mind that by changing the date you also modify the status of the page!
            </Form.Text>

            <Form.Group controlId="pageDate">
                <Form.Label className='fw-light'>Date</Form.Label>
                <Form.Control value={publicationDate} onChange={(ev) => { setPublicationDate(dayjs(ev.target.value).format("YYYY-MM-DD")) }} type="date" name="date" min={dayjs().format('YYYY-MM-DD')} />
                <Button variant='success' onClick={() => setPublicationDate('NULL')}>REMOVE DATE</Button>
            </Form.Group>

            <hr />
            <Button variant='primary' onClick={handleSave}>SAVE</Button>{' '}
            <Button variant='secondary' onClick={handleCancel}>BACK</Button>

        </Form>
    </>
}

export {EditPage}