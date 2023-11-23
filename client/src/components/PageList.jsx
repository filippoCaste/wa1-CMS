import { Button, Table } from "react-bootstrap";

import dayjs from 'dayjs';
import { useNavigate } from "react-router";
import { useState } from "react";
import { deletePage, getAllPages } from "../API";

function PageList(props) {
    const pages = props.pages;
    const setPages = props.setPages;
    const [waiting, setWaiting] = useState(false);

    const handleDelete = async (id) => {
        setWaiting(true);
        await deletePage(id);
        const list = await getAllPages();
        setPages(list);
        setWaiting(false);
    }

    return (<>
        <Table hover>
            <thead>
            </thead>
            <tbody>
                <tr>
                    <th/>
                    <th>Title</th>
                    <th>Creation Date</th>
                    <th>Publication Date</th>
                    <th>Status</th>
                    <th/>
                </tr>
                {
                    pages.map((p) =>
                        <PageDetails key={p.id} page={p} user={props.user} frontOffice={props.frontOffice} waiting={waiting} handleDelete={handleDelete} />
                    )
                }
            </tbody>
            <tfoot>
            </tfoot>
        </Table>
    </>);
}

function PageDetails(props) {

    const navigate = useNavigate();

    const formatDate = (date, format) => {
        return date ? dayjs(date).format(format) : '';
    }

    return (
        <tr>
            <td>
                <Button disabled={props.waiting} onClick={() => navigate(`/pages/${props.page.id}`)}>
                    <i className="bi bi-box-arrow-up-right"></i>
                </Button>
            </td>
            <td>
                <p>
                    {props.page.title}
                </p>
            </td>
            <td>
                <small>{formatDate(props.page.creationDate, 'MMMM D, YYYY')}</small>
            </td>
            <td>
                <small>{formatDate(props.page.publicationDate, 'MMMM D, YYYY')}</small>
            </td>
            <td>
                <Status page={props.page} />
            </td>
            <td>
                {!props.frontOffice && (props.user.id === props.page.authorID || props.user.role==='admin') && <Button disabled={props.waiting} variant="warning" onClick={() => navigate(`/pages/editpage/${props.page.id}`)}>
                    <i className="bi bi-pencil-square" />
                </Button>}{'  '}
                {!props.frontOffice && (props.user.id === props.page.authorID || props.user.role === 'admin') && <Button disabled={props.waiting} variant='danger' onClick={() => props.handleDelete(props.page.id)}>
                    <i className="bi bi-trash" />
                </Button>}
            </td>
        </tr>
    );
}

function Status(props) {
    const page = props.page;
    return (
        (dayjs(page.publicationDate).isAfter(dayjs()) && 'scheduled' ) ||
        (!page.publicationDate && 'draft' ) ||
        (dayjs(page.publicationDate).isBefore(dayjs()) && 'published')
    );
}

export default PageList;