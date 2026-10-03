import HeroSection from '@/components/home/hero-section';
import {Button} from '@/components/ui/button'; 
import BgGradient from '@/components/common/bg-gradient';
import DemoSection from '@/components/home/demosection';
import HowItWorks from '@/components/home/how-it-works';
import PricingSection from '@/components/home/pricing-section';
import CTASection from '@/components/home/cta-section';
export default function Home() {
  return (
    <div className="relative w-full">
      <BgGradient/>
    <div className="flex flex-col">
      <HeroSection/>
      <DemoSection/>
      <HowItWorks/>
      <PricingSection/>
      <CTASection/>
    </div>
    </div>
  );
}  