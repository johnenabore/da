import { About } from "@/components/about/about"
import { BookingCalendar } from "@/components/booking/booking-calendar"
import { FeaturedWork } from "@/components/featuredwork/featured-work"
import { Footer } from "@/components/footer/footer"
import { HeroComponent } from "@/components/hero/hero"
import { IntroProvider } from "@/components/hero/intro"
import { ParallaxGallery } from "@/components/hero/parallax-gallery"
import { SmoothScroll } from "@/components/smooth-scroll"
import { Testimonials } from "@/components/testimonials/testimonials"

const HomePage = () => {
   return (
      <IntroProvider>
         <SmoothScroll />
         <main className="relative z-10 bg-background">
             <HeroComponent />
             <ParallaxGallery />
             <FeaturedWork />
             <About />
             <Testimonials />
             <BookingCalendar />
         </main>
         <Footer />
      </IntroProvider>
   )
}

export default HomePage
