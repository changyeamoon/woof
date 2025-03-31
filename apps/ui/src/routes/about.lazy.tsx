import { createLazyFileRoute } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'

import { Button } from '../shared/components/button.tsx'

export const Route = createLazyFileRoute('/about')({
	component: AboutPage,
})

// thank you ai
export default function AboutPage() {
	return (
		<main>
			<section className='py-20 md:py-28'>
				<div className='container mx-auto px-4 text-center max-w-4xl'>
					<h1 className='text-4xl md:text-6xl font-bold mb-6 tracking-tight'>
						WOOF exists to grow your business money
					</h1>
					<div className='w-16 h-1 bg-woof mx-auto mb-8'></div>
					<p className='text-xl text-gray-600 mb-2'>
						WOOF believes you deserve the majority of the returns on your investments.
					</p>
					<p className='text-xl text-gray-600'>When you win, WOOF wins</p>
				</div>
			</section>

			{/* Stats Section */}
			<section className='py-20 border-t border-b'>
				<div className='container mx-auto px-4'>
					<div className='grid grid-cols-1 md:grid-cols-3 gap-8 text-center'>
						<div className='space-y-2'>
							<h2 className='text-5xl font-bold'>$42M+</h2>
							<p className='text-gray-600'>Expected 2025 interest paid by our Partner Banks</p>
						</div>

						<div className='space-y-2'>
							<h2 className='text-5xl font-bold'>$2.5B+</h2>
							<p className='text-gray-600'>WOOF Technologies assets on platform</p>
						</div>

						<div className='space-y-2'>
							<h2 className='text-5xl font-bold'>2,500+</h2>
							<p className='text-gray-600'>Businesses with funded accounts through WOOF</p>
						</div>
					</div>
				</div>
			</section>

			{/* Philosophy Section */}
			<section className='py-20'>
				<div className='container mx-auto px-4'>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-16 items-center'>
						<div>
							<h2 className='text-3xl md:text-4xl font-bold mb-8 leading-tight'>
								We believe the majority of the economics belong to you, the customer.
							</h2>
							<div className='w-16 h-1 bg-woof mb-8'></div>
						</div>

						<div className='space-y-6'>
							<p className='text-gray-700'>
								Financial services have always felt icky to us. That's why we started WOOF.
							</p>

							<p className='text-gray-700'>
								We're building this company with what we call a "Wall Street Bark with Main Street Heart." We don't
								believe in fancy offices. We don't believe in having a big headcount because it impresses people at
								cocktail parties.
							</p>

							<p className='text-gray-700'>
								We care about keeping our costs low at WOOF, so that we can hopefully pass back better and better
								savings to our customers. Because at the end of the day, that's all that matters to your business.
							</p>

							<p className='text-gray-700'>
								We're so grateful for the opportunity to serve you. If we can ever be of assistance or make your
								experience better, please let us know.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className='py-20 bg-woof text-white'>
				<div className='container mx-auto px-4 text-center'>
					<h2 className='text-3xl md:text-4xl font-bold mb-6'>Ready to fetch better returns?</h2>
					<p className='text-xl mb-8 max-w-2xl mx-auto'>
						Join thousands of businesses who trust WOOF with their finances. Opening an account takes less than 5
						minutes.
					</p>
					<Button size='lg' className='bg-white text-woof hover:bg-gray-100'>
						Get Started <ArrowRight className='ml-2 h-5 w-5' />
					</Button>
				</div>
			</section>
		</main>
	)
}
