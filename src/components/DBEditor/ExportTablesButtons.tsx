import { Box, Button, Grid} from "@mui/material";
import API, { authHelper } from '../../api';

const ExportTablesButtons = () => {

    const exportAll = () => {
        authHelper(API.exportDB);
    }

    return (
        <Button onClick={exportAll} variant="contained">Export DB</Button>
    );
}

export default ExportTablesButtons;