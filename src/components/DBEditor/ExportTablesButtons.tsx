import { Box, Button, Grid} from "@mui/material";
import { exportDB } from '../../api';

const ExportTablesButtons = () => {

    const exportAll = () => {
        exportDB();
    }

    return (
        <Button onClick={exportAll} variant="contained">Export DB</Button>
    );
}

export default ExportTablesButtons;