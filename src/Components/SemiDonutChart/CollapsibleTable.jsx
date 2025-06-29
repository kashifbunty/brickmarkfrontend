import React, { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Collapse,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { formatNumberWithCommas, translate } from '@/utils/helper';

const CollapsibleTable = ({ data }) => {
    const [openRow, setOpenRow] = useState(null);


    const toggleRow = (rowId) => {
        if (openRow === rowId) {
            setOpenRow(null);
        } else {
            setOpenRow(rowId);
        }
    };

    const cellWidths = ['5%', '15%', '15%', '15%', '15%', '15%'];

    return (
        <>
            {data && data.length > 0 &&
                <TableContainer className='main_tabel_conatiner'>
                    <Table className='main_tabel' >
                        <TableHead className='main_tabel_header'>
                            <TableRow className='main_table_row'>
                                <TableCell className="main_table_cell" align="center">#</TableCell>
                                <TableCell className="main_table_cell" align="left" style={{ width: cellWidths[0] }}>{translate("year")}</TableCell>
                                {/* <TableCell className="main_table_cell" align="left" style={{ width: cellWidths[1] }}>Monthly EMI</TableCell> */}
                                <TableCell className="main_table_cell" align="left" style={{ width: cellWidths[2] }}>{translate("PrincipalAmount")}</TableCell>
                                <TableCell className="main_table_cell" align="left" style={{ width: cellWidths[3] }}>{translate("InterestPayable")}</TableCell>
                                <TableCell className="main_table_cell" align="left" style={{ width: cellWidths[4] }}>{translate("outstandingBalnce")}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.map((row, index) => (
                                <React.Fragment key={index}>
                                    <TableRow onClick={() => toggleRow(index)} className={`${openRow === index ? 'active_row' : 'simple_row'}`}>
                                        <TableCell align="center" style={{ width: cellWidths[0], padding: 0 }}>
                                            <IconButton aria-label="expand row" size="small" className='icon_buttton'>
                                                {openRow === index ? <RemoveIcon className='remove' /> : <AddIcon className='add' />}
                                            </IconButton>
                                        </TableCell>
                                        <TableCell align="left" className={`${openRow === index ? 'active_cell' : 'simple_cell'}`} style={{ width: cellWidths[1] }}>{row?.year}</TableCell>
                                        <TableCell align="left" className={`${openRow === index ? 'active_cell' : 'simple_cell'}`} style={{ width: cellWidths[3] }}>{formatNumberWithCommas(row?.principal_amount)}</TableCell>
                                        <TableCell align="left" className={`${openRow === index ? 'active_cell' : 'simple_cell'}`} style={{ width: cellWidths[4] }}>{formatNumberWithCommas(row?.interest_paid)}</TableCell>
                                        <TableCell align="left" className={`${openRow === index ? 'active_cell' : 'simple_cell'}`} style={{ width: cellWidths[5] }}>{formatNumberWithCommas(row?.remaining_balance)}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell colSpan={6} style={{ padding: 0, width: "100%" }}>
                                            <Collapse in={openRow === index} timeout="auto" unmountOnExit>
                                                <Table size="small" aria-label="purchases" style={{ width: "100%" }}>
                                                    <TableBody style={{ padding: "0" }}>
                                                        {row?.monthly_totals?.map((monthData, monthIndex) => (
                                                            <TableRow key={monthIndex}>
                                                                <TableCell align="center" style={{ width: cellWidths[0] }} className='simple_sub_cell'></TableCell>
                                                                <TableCell align="left" style={{ width: cellWidths[1] }} className='simple_sub_cell'>{monthData?.month}</TableCell>
                                                                <TableCell align="left" style={{ width: cellWidths[3] }} className='simple_sub_cell'>{formatNumberWithCommas(monthData?.principal_amount)}</TableCell>
                                                                <TableCell align="left" style={{ width: cellWidths[4] }} className='simple_sub_cell'>{formatNumberWithCommas(monthData?.payable_interest)}</TableCell>
                                                                <TableCell align="left" style={{ width: cellWidths[5] }} className='simple_sub_cell'>{formatNumberWithCommas(monthData?.remaining_balance)}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </Collapse>
                                        </TableCell>
                                    </TableRow>
                                </React.Fragment>
                            ))}
                        </TableBody>


                    </Table>
                </TableContainer>
            }
        </>
    );
};

export default CollapsibleTable;
