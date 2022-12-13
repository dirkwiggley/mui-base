import { Box, Button} from "@mui/material";
import { exportDB } from '../../api';

const ExportTablesButtons = () => {

    const exportAll = () => {
        exportDB();
    }

    return (
        <Box>
            <Button onClick={exportAll}>Export DB</Button>
        </Box>

    );
}

export default ExportTablesButtons;