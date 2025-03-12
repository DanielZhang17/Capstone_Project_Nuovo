import { Box, Container, Heading, Text } from '@chakra-ui/react';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';

const About = () => {
  return (
    <Box>
      <NavBar />
      <Container maxW="800px" py={8} textAlign="center">
        <Heading as="h1" size="xl" mb={6}>
          About Nuovo
        </Heading>
        <Text mb={4}>
          Welcome to <strong>Nuovo</strong>, your personal shopping assistant that keeps you effortlessly connected to the items you love.
          Designed for savvy shoppers, Nuovo tracks products from leading retailers and notifies you as soon as they go on sale, restock, or are newly released.
        </Text>
        <Text mb={4}>
          At Nuovo, we’re committed to transforming the shopping experience. We know it can be frustrating to miss out on an item due to limited stock, unpredictable sales, or simply not knowing when new products arrive.
          Our platform ensures that you’ll never miss an opportunity. By setting your preferences, you can stay ahead with timely updates that align with your personal shopping goals, whether it’s snagging a deal, catching a restock, or being the first to see new releases.
        </Text>
        <Text mb={4}>
          Our mission is to empower shoppers with a tool that saves both time and money. Nuovo streamlines your experience by taking care of the tracking, so you can focus on finding what matters most without the stress of constantly checking for updates.
          Our notifications are designed to be both simple and effective, giving you instant insights on price drops, availability, and exclusive launches, all in one place.
        </Text>
        <Text>
          Discover a smarter way to shop with Nuovo—where we take the hassle out of shopping by keeping an eye on the products you care about. Just add your favorite items, and let us keep you in the loop.
          Nuovo is here to elevate your shopping experience, giving you a direct line to the items that matter most to you.
        </Text>
      </Container>
      <Footer />
    </Box>
  );
};

export default About;
