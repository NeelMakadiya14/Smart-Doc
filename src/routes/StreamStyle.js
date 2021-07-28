import { makeStyles } from "@material-ui/styles";

export const useStyles = makeStyles((theme) => ({
  videoStyle: {
    borderRadius: "15px",
    width: "100%",
    transform: "rotateY(180deg)",
  },
  btn: {
    marginLeft: "10px",
    alignItems: "right",
    fontFamily: "Poppins",
  },
}));
