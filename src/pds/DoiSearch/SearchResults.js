import React, {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import Button from '@material-ui/core/Button';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import {makeStyles} from "@material-ui/core/styles";
import rootActions from "./actions/rootActions";
import {Alert} from "@material-ui/lab";
import Typography from '@material-ui/core/Typography';
import { useHistory } from 'react-router-dom'

const useStyles = makeStyles((theme) => ({
	alert: {
		'& .MuiAlert-message':{
			marginLeft: "auto",
			marginRight: "auto"
		},
		marginLeft: "auto",
		marginRight: "auto"
	},
	tableContainer: {
		maxHeight: 'calc(100vh - 375px)',
	},
	tableHeader: {
		'& th': {
			fontWeight: 'bold',
		},
	},
	tablePagination: {
		backgroundColor: '#fafafa',
		width: '100%'
	},
	alignLeft: {
		textAlign: 'left',
		alignSelf: 'flex-start'
	}
}));

const SearchResults = (props) => {
	const history = useHistory();
	const classes = useStyles();
	const dispatch = useDispatch();

	const data = useSelector(state => {
		return state.appReducer.searchResponse;
	});
	
	const handleReleaseClick = (lidvid) => {
		history.push("/release/" + lidvid);
		dispatch(rootActions.appAction.setIsReleasing({"page": true, "identifier": lidvid}));
		dispatch(rootActions.appAction.resetSearch());
		dispatch(rootActions.appAction.sendLidvidSearchRequest(lidvid));
	};

	const massageStatus = (string) => {
		if (string === "review") {
			return "In " + capitalizeWord(string);
		} else {
			return capitalizeWord(string);
		}
	};

	const capitalizeWord = (string) => {
		return string.charAt(0).toUpperCase() + string.slice(1);
	};

	const determineDoiLink = (status, doi, fieldValue) => {
		if (typeof fieldValue == 'undefined') { // field is DOI
			if (doi) return createTableCell(status, doi, doi);
			else return <TableCell>-</TableCell>;
		} else {	// field is LIDVID
			return createTableCell(status, doi, fieldValue);
		}
	}
	
	const createTableCell = (status, doi, fieldValue) => {
		if (status.toLowerCase() === 'registered')
			return <TableCell>{createDoiLink(doi, fieldValue)}</TableCell>;
		else
			return <TableCell>{fieldValue}</TableCell>;
	}
	
	const createDoiLink = (doi, fieldValue) => {
		return <a href={`https://doi.org/${doi}`} target="_blank" rel="noopener noreferrer">{fieldValue}</a>
	}
	
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(20);
	const handleChangePage = (event, newPage) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = (event) => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	return (
		<div>
			{data ?
				data.errors ?
					<Alert icon={false} severity="error" className={classes.alert}>
						{data.errors[0].message}
					</Alert>
					:
					<div>
						{data.length === 1 ?
							<Typography className={classes.alignLeft}>1 result found</Typography>
								:
							<Typography className={classes.alignLeft}>{data.length} results found</Typography>
						}
						<TableContainer className={classes.tableContainer}>
							<Table size="small" aria-label="a dense, sticky, paginated table" stickyHeader>
								<TableHead className={classes.tableHeader}>
									<TableRow>
										<TableCell>DOI</TableCell>
										<TableCell>Identifier</TableCell>
										<TableCell>Title</TableCell>
										<TableCell>Status</TableCell>
										{props.showActions? <TableCell>Action</TableCell>:''}
									</TableRow>
								</TableHead>
								<TableBody>
									{
										(rowsPerPage > 0 ?
											data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
											:
											data
										).map((dataItem) => {
											return (
												<TableRow hover key={dataItem.lidvid}>
												<TableCell>{determineDoiLink(dataItem.status, dataItem.doi)}</TableCell>
												<TableCell>{determineDoiLink(dataItem.status, dataItem.doi, dataItem.identifier)}</TableCell>
												<TableCell>{dataItem.title}</TableCell>
												<TableCell>{massageStatus(dataItem.status.toLowerCase())}</TableCell>
												{props.showActions?
													<TableCell>{(() => {
														switch (dataItem.status.toLowerCase()) {
															case 'draft':
															case 'reserved':
																return (
																		<Button color="primary"
																						variant="contained"
																						onClick={(event) => handleReleaseClick(dataItem.identifier)}
																		>
																			Release
																		</Button>
																);
															case 'registered':
																return (
																		<Button color="primary"
																						variant="contained"
																						onClick={(event) => handleReleaseClick(dataItem.identifier)}
																		>
																			Update
																		</Button>
																);
															case 'review':
																return (
																		<Button disabled
																						variant="contained"
																		>
																			Pending
																		</Button>
																);
															default:
																return '-';
														}
													})()}</TableCell>
													:
													''
												}
												</TableRow>
											);
										})
									}
								</TableBody>
							</Table>
						</TableContainer>
						{data.length > rowsPerPage && (
							<TablePagination
								className={classes.tablePagination}
								rowsPerPageOptions={[10, 20, 50, {label: 'All', value: -1}]}
								component="div"
								count={data.length}
								rowsPerPage={rowsPerPage}
								page={page}
								onChangePage={handleChangePage}
								onChangeRowsPerPage={handleChangeRowsPerPage}
							/>
						)}
					</div>
				
				:
				<div>
				</div>
			}
		</div>
	)
};

export default SearchResults;