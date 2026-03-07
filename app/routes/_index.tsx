import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";

interface HomeProps {
	onNavigate: (view: string) => void;
}


export default function Home({ onNavigate }: HomeProps) {
	const handleGetStarted = () => onNavigate("disaster-records");
	const handleLearnMore = () => onNavigate("about");

	return (
		<div className="min-h-screen">

			{/* HERO */}
			<section className="relative bg-gradient-to-r from-[#004F91] to-blue-800 text-white overflow-hidden">
				<div className="absolute inset-0 bg-black/20"></div>

				<div className="absolute right-0 top-0 h-full w-1/2 overflow-hidden">
					<img
						src="/assets/images/forest.jpg"
						className="w-full h-full object-cover opacity-80"
					/>
				</div>

				<div className="relative container mx-auto px-4 py-24">
					<div className="max-w-2xl">
						<h1 className="text-5xl font-bold mb-6">
							Disaster tracking system
						</h1>

						<p className="text-xl text-blue-100 mb-10">
							A comprehensive data collection system for disaster events,
							hazardous situations, and emergency response coordination.
						</p>

						<div className="flex gap-4">
							<Button
								label="Get started"
								icon="pi pi-arrow-right"
								iconPos="right"
								onClick={handleGetStarted}
								className="bg-white text-[#004F91] font-bold px-8 h-14"
							/>

							<Button
								label="Learn more"
								outlined
								onClick={handleLearnMore}
								className="text-white !border-white px-8 h-14"
							/>
						</div>
					</div>
				</div>
			</section>

			{/* HOW IT WORKS */}
			<section className="py-24 bg-gradient-to-b from-blue-50 to-blue-100">
				<div className="container mx-auto px-4">

					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-[#004F91]">
							How it works
						</h2>
					</div>

					<div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">

						<Card className="border border-blue-200 bg-white overflow-hidden !rounded-2xl text-center shadow-md">
							<div className="p-10">
								<div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
									<i className="pi pi-database text-[#004F91]" style={{ fontSize: "2.5rem" }} />
								</div>

								<h3 className="text-2xl font-bold mb-4">Collect</h3>

								<p className="text-gray-600">
									Capture comprehensive disaster and hazardous event data
									through structured workflows
								</p>
							</div>
						</Card>

						<Card className="border border-blue-200 bg-white overflow-hidden !rounded-2xl text-center shadow-md">
							<div className="p-10">
								<div className="w-20 h-20 bg-blue-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
									<i className="pi pi-chart-bar text-[#004F91]" style={{ fontSize: "2.5rem" }} />
								</div>

								<h3 className="text-2xl font-bold mb-4">Analyze</h3>

								<p className="text-gray-600">
									Analyze trends based on comprehensive data to understand
									patterns and impacts
								</p>
							</div>
						</Card>

						<Card className="border border-blue-200 bg-white overflow-hidden !rounded-2xl text-center shadow-md">
							<div className="p-10">
								<div className="w-20 h-20 bg-blue-300 rounded-2xl flex items-center justify-center mx-auto mb-6">
									<i className="pi pi-shield text-[#004F91]" style={{ fontSize: "2.5rem" }} />
								</div>

								<h3 className="text-2xl font-bold mb-4">Prevent</h3>

								<p className="text-gray-600">
									Develop prevention and mitigation strategies based on
									lessons learned from disaster patterns
								</p>
							</div>
						</Card>

					</div>
				</div>
			</section>

			{/* KEY FEATURES */}
			<section className="py-24 bg-white">
				<div className="container mx-auto px-4">

					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-[#004F91]">
							Key features
						</h2>
					</div>

					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">

						<Card className="border border-blue-200 !shadow-none hover:!shadow-xl transition-all duration-300 bg-white overflow-hidden !rounded-2xl">
							<div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
								<i className="pi pi-chart-bar text-xl text-[#004F91]" style={{ fontSize: "1.5rem" }} />
							</div>
							<div className="text-xl font-bold mb-4">Advanced analytics</div>
							<div className="text-muted-foreground leading-relaxed">
								Comprehensive dashboard with real-time analytics and
								reporting capabilities for disaster management
							</div>
						</Card>

						<Card className="border border-blue-200 !shadow-none hover:!shadow-xl transition-all duration-300 bg-white overflow-hidden !rounded-2xl">
							<div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
								<i className="pi pi-exclamation-circle text-xl text-orange-500" style={{ fontSize: "1.5rem" }} />
							</div>
							<div className="text-xl font-bold mb-4">Rapid damage assessment</div>
							<div className="text-muted-foreground leading-relaxed">
								Quick and systematic damage assessment tools for immediate
								post-disaster evaluation
							</div>
						</Card>

						<Card className="border border-blue-200 !shadow-none hover:!shadow-xl transition-all duration-300 bg-white overflow-hidden !rounded-2xl">
							<div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
								<i className="pi pi-wave-pulse text-xl text-[#004F91]" style={{ fontSize: "1.5rem" }} />
							</div>
							<div className="text-xl font-bold mb-4">Monitoring</div>
							<div className="text-muted-foreground leading-relaxed">
								Continuous monitoring systems for early warning and
								real-time disaster tracking
							</div>
						</Card>

						<Card className="border border-blue-200 !shadow-none hover:!shadow-xl transition-all duration-300 bg-white overflow-hidden !rounded-2xl">
							<div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
								<i className="pi pi-file-check text-xl text-purple-600" style={{ fontSize: "1.5rem" }} />
							</div>
							<div className="text-xl font-bold mb-4">Impact-loss review</div>
							<div className="text-muted-foreground leading-relaxed">
								Detailed impact and loss assessment with comprehensive review workflows
							</div>
						</Card>

						<Card className="border border-blue-200 !shadow-none hover:!shadow-xl transition-all duration-300 bg-white overflow-hidden !rounded-2xl">
							<div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
								<i className="pi pi-users text-xl text-orange-600" style={{ fontSize: "1.5rem" }} />
							</div>
							<div className="text-xl font-bold mb-4">Multi-stakeholder access</div>
							<div className="text-muted-foreground leading-relaxed">
								Role-based access control for multiple stakeholders and emergency response teams
							</div>
						</Card>

						<Card className="border border-blue-200 !shadow-none hover:!shadow-xl transition-all duration-300 bg-white overflow-hidden !rounded-2xl">
							<div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center mb-4">
								<i className="pi pi-check-circle text-xl bg-text-600" style={{ fontSize: "1.5rem" }} />
							</div>
							<div className="text-xl font-bold mb-4">Real-time geospatial</div>
							<div className="text-muted-foreground leading-relaxed">
								Advanced geospatial mapping and real-time location tracking for disaster events
							</div>
						</Card>

					</div>
				</div>
			</section>

			{/* DATA COLLECTION */}
			<section className="py-24 bg-gray-50">
				<div className="container mx-auto px-4">

					<div className="text-center mb-16">
						<h2 className="text-4xl font-bold text-[#004F91] mb-4">
							Data collection systems
						</h2>

						<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
							Our platform supports three specialized workflows for emergency
							management needs.
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">


						<div className="border border-orange-200 hover:shadow-xl transition-all duration-300 bg-white overflow-hidden rounded-lg  ">
							<div className="flex flex-col h-full">
								{/* Header */}
								<div className="bg-orange-50/50 pt-6 pb-6">
									<div className="px-6">
										<div className="flex items-center gap-3 mb-3">
											<i
												className="pi pi-exclamation-circle text-orange-500"
												style={{ fontSize: '2.5rem' }}
											/>
											<Tag
												severity="warning"
												value="Risk assessment"
												pt={{
													root: {
														className: 'bg-orange-100 text-orange-800 text-sm font-medium px-3 py-1 border-none rounded-md'
													}
												}}
											/>
										</div>
										<h2 className="text-2xl font-bold text-orange-700 m-0">
											Hazardous events
										</h2>
									</div>
								</div>

								{/* Main content */}
								<div className="px-6 py-6 space-y-6 flex-grow">
									<p className="text-muted-foreground leading-relaxed">
										Track and assess potentially dangerous situations before they become disasters
									</p>

									<ul className="space-y-3 text-sm text-gray-700">
										<li className="flex items-center gap-3">
											<i className="pi pi-check-circle text-[#106cb8] text-lg" />
											Risk assessment and monitoring
										</li>
										<li className="flex items-center gap-3">
											<i className="pi pi-check-circle text-[#106cb8] text-lg" />
											Geographic impact analysis
										</li>
										<li className="flex items-center gap-3">
											<i className="pi pi-check-circle text-[#106cb8] text-lg" />
											Cascading event tracking
										</li>
									</ul>
								</div>

								{/* Footer */}
								<div className="px-6 pb-6 pt-2 border-t border-gray-100 flex justify-center">
									<Button
										label="View hazardous events"
										onClick={() => onNavigate('hazardous-events')}
										outlined
										severity="warning"
									/>
								</div>
							</div>
						</div>

						<div className="border border-blue-200 hover:shadow-xl transition-all duration-300 bg-white overflow-hidden rounded-lg  ">
							<div className="flex flex-col h-full">
								{/* Header */}
								<div className="bg-blue-50/50 pt-6 pb-6">
									<div className="px-6">
										<div className="flex items-center gap-3 mb-3">
											<i
												className="pi pi-bolt text-[#004F91]"
												style={{ fontSize: '2.5rem' }}
											/>
											<Tag
												value="Active response"
												pt={{
													root: {
														className: '!bg-blue-100 !text-[#004F91] text-sm font-medium px-3 py-1 border-none rounded-md'
													}
												}}
											/>
										</div>
										<h2 className="text-2xl font-bold text-[#004F91] m-0">
											Disaster events
										</h2>
									</div>
								</div>

								{/* Main content */}
								<div className="px-6 py-6 space-y-6 flex-grow">
									<p className="text-muted-foreground leading-relaxed">
										Manage active disasters requiring immediate response and coordination
									</p>

									<ul className="space-y-3 text-sm text-gray-700">
										<li className="flex items-center gap-3">
											<i className="pi pi-check-circle text-[#106cb8] text-lg" />
											Real-time event monitoring
										</li>
										<li className="flex items-center gap-3">
											<i className="pi pi-check-circle text-[#106cb8] text-lg" />
											Response coordination
										</li>
										<li className="flex items-center gap-3">
											<i className="pi pi-check-circle text-[#106cb8] text-lg" />
											Impact assessment
										</li>
									</ul>
								</div>

								{/* Footer */}
								<div className="px-6 pb-6 pt-2 border-t border-gray-100 flex justify-center">
									<Button
										label="View disaster events"
										onClick={() => onNavigate('disaster-events')}
										outlined
										severity="info"
										className="!border-primary/20 !text-[#004F91]"
									/>
								</div>
							</div>
						</div>

						<div className="border border-blue-200 hover:shadow-xl transition-all duration-300 bg-white overflow-hidden rounded-lg  ">
							<div className="flex flex-col h-full">
								{/* Header */}
								<div className="bg-blue-50/50 pt-6 pb-6">
									<div className="px-6">
										<div className="flex items-center gap-3 mb-3">
											<i
												className="pi pi-file-check text-blue-500"
												style={{ fontSize: '2.5rem' }}
											/>
											<Tag
												value="Documentation"
												pt={{
													root: {
														className: '!bg-blue-100 !text-[#004F91] text-sm font-medium px-3 py-1 border-none rounded-md'
													}
												}}
											/>
										</div>
										<h2 className="text-2xl font-bold text-blue-500 m-0">
											Disaster records
										</h2>
									</div>
								</div>

								{/* Main content */}
								<div className="px-6 py-6 space-y-6 flex-grow">
									<p className="text-muted-foreground leading-relaxed">
										Comprehensive documentation of disaster impacts and response actions
									</p>

									<ul className="space-y-3 text-sm text-gray-700">
										<li className="flex items-center gap-3">
											<i className="pi pi-check-circle text-[#106cb8] text-lg" />
											Detailed impact documentation
										</li>
										<li className="flex items-center gap-3">
											<i className="pi pi-check-circle text-[#106cb8] text-lg" />
											Multi-step data collection
										</li>
										<li className="flex items-center gap-3">
											<i className="pi pi-check-circle text-[#106cb8] text-lg" />
											Approval workflows
										</li>
									</ul>
								</div>

								{/* Footer */}
								<div className="px-6 pb-6 pt-2 border-t border-gray-100 flex justify-center">
									<Button
										label="View disaster records"
										onClick={() => onNavigate('disaster-records')}
										outlined
										severity="info"
										className="!border-blue-500 !text-blue-500"
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section >

			{/* CTA */}
			< section className="py-24 bg-[#004F91] text-white text-center" >
				<h2 className="text-5xl font-bold mb-6">
					Ready to get started?
				</h2>

				<p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
					Join emergency response teams worldwide in building resilient
					communities.
				</p>

				<div className="flex justify-center gap-4">
					<Button
						label="Start collecting data"
						onClick={handleGetStarted}
						className="bg-white text-[#004F91] px-10 h-14 font-bold"
					/>

					<Button
						label="View analytics"
						outlined
						className="border-white text-white px-10 h-14"
						onClick={() => onNavigate("analytics")}
					/>
				</div>
			</section >

		</div >
	);
}