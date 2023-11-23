import { useState } from "react";
import { Button, Container, Form, Image } from "react-bootstrap";

function PageContent(props) {
    const contents = props.contents;
    const isTheAuthor = props.isTheAuthor;
    const view = props.view;

    return <Container>
        {
            contents.map((c) => {
                if (c.type === 'image') {
                    return <div key={c.id + '-div'} className='content-div'>
                        {isTheAuthor && !view && c.level !== 0 && <Button key={c.id + "btn^"} disabled={props.waiting} variant="outline-primary" onClick={() => props.upPosition(c.id)}> <i className="bi bi-arrow-up-circle-fill"></i> </Button>}{' '}
                        {isTheAuthor && !view && <Button key={c.id + "btnv"} disabled={props.waiting} variant="outline-primary" onClick={() => props.downPosition(c.id)}> <i className="bi bi-arrow-down-circle-fill"></i> </Button>}{' '}
                        <Image className="resized-image" key={c.id} src={`http://localhost:3000/${c.value}`} rounded />
                        {isTheAuthor && !view && <Button variant='danger' id="delButton" onClick={() => props.handleDelete(c.id)}> <i className="bi bi-trash" /> </Button> }
                    </div>
                } else if (c.type === 'paragraph') {
                    return <div key={c.id + '-div'} className='content-div'>
                        {isTheAuthor && !view && c.level!==0 && <Button key={c.id + "btn^"} disabled={props.waiting} variant="outline-primary" onClick={() => props.upPosition(c.id)}> <i className="bi bi-arrow-up-circle-fill"></i> </Button>}{' '}
                        {isTheAuthor && !view && <Button key={c.id + "btnv"} disabled={props.waiting} variant="outline-primary" onClick={() => props.downPosition(c.id)}> <i className="bi bi-arrow-down-circle-fill"></i> </Button>}{' '}
                        {(isTheAuthor && !view) ? <EditText key={c.id + '-edit'} value={c.value} id={c.id} handleSave={props.handleSave} handleDelete={props.handleDelete} /> : <p key={c.id}>{c.value}</p>}
                    </div>
                } else if (c.type === 'header') {
                    return <div key={c.id + '-div'} className='content-div'>
                        {isTheAuthor && !view && c.level !== 0 && <Button key={c.id + "btn^"} disabled={props.waiting} variant="outline-primary" onClick={() => props.upPosition(c.id)}> <i className="bi bi-arrow-up-circle-fill"></i> </Button>}{' '}
                        {isTheAuthor && !view && <Button key={c.id + "btnv"} disabled={props.waiting} variant="outline-primary" onClick={() => props.downPosition(c.id)}> <i className="bi bi-arrow-down-circle-fill"></i> </Button>}{' '}
                        {(isTheAuthor && !view) ? <EditText key={c.id + '-edit'} value={c.value} id={c.id} handleSave={props.handleSave} handleDelete={props.handleDelete} /> : <h2 key={c.id}>{c.value}</h2>}
                    </div>
                }
            })
        }
    </Container>
}

function EditText(props) {
    const [value, setValue] = useState(props.value);
    const id = props.id;

    function handleSave() {
        if (value !== '') {
            props.handleSave(id, value);
        } else {
            setErr('Empty paragraph is not permitted');
        }
    }

    return <>
        <Form.Group className="mb-3" controlId='textForm'>
            <Form.Control as="textarea" value={value} onChange={(ev) => { setValue(ev.target.value) }} rows={5} />
        </Form.Group>
        <Form.Text className="text-muted">
            <p>Remember to save your changes!</p>
        </Form.Text>
        <Button variant='success' id="saveButton" onClick={handleSave}>SAVE</Button> {' '}
        <Button variant='danger' id="delButton" onClick={() => props.handleDelete(id)}>
            <i className="bi bi-trash" />
        </Button>
    </>
}


export {PageContent}