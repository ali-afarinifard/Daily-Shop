// ** Components
import Container from "./components/Container";
import Features from "./components/features/Features";
import TopProducts from "./components/TopProducts";
import Guidance from "./components/guidance/Guidance";
import Banner from "./components/banner/Banner";

// ** MUI
import { Box } from "@mui/material";

export default function Home() {

  return (
    <Box
      component="div"
    >
      <Box
        component="div"
        sx={{
          pt: '2.2rem',
          mt: { xs: 0, lg: '1.6rem' }
        }}
      >
        <Banner />
        <Container>
          <TopProducts />
          <Features />
          <Guidance />
        </Container>
      </Box>
    </Box>
  );
}
