
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs: FAQItem[];
}

const FAQSection: React.FC<FAQSectionProps> = ({ faqs }) => {
  return (
    <div className="max-w-3xl mx-auto mt-16">
      <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
      
      <Accordion type="single" collapsible className="space-y-4">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg overflow-hidden">
            <Card>
              <CardContent className="p-0">
                <AccordionTrigger className="px-6 py-4 font-semibold">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 text-gray-600 text-sm">
                  {faq.answer}
                </AccordionContent>
              </CardContent>
            </Card>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default FAQSection;
