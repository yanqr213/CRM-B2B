
import React, { useState } from 'react';
import { Product, User, UserRole } from '../types';
import { Download, ChevronDown, ChevronUp, LifeBuoy, FileText, ArrowRight, ArrowLeft } from 'lucide-react';

interface ProductsProps {
  products: Product[];
  onRequestSupport: (productId: string) => void;
  currentUser: User;
}

const Products: React.FC<ProductsProps> = ({ products, onRequestSupport, currentUser }) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // --- Detail View ---
  if (selectedProduct) {
    return (
      <div className="animate-fade-in">
        <button 
          onClick={() => setSelectedProduct(null)} 
          className="mb-6 text-sm font-medium text-gray-500 hover:text-blue-600 flex items-center gap-2 transition-colors bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm w-fit"
        >
          <ArrowLeft size={16} /> 返回产品列表
        </button>
        
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
          {/* Product Header */}
          <div className="md:flex">
            <div className="md:w-1/3 bg-gray-100 p-8 flex items-center justify-center border-r border-gray-100">
              <img src={selectedProduct.imageUrl} alt={selectedProduct.name} className="max-w-full h-auto rounded-lg shadow-lg" />
            </div>
            <div className="p-8 md:w-2/3 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                   <div>
                     <span className="text-sm text-blue-600 font-bold tracking-wide uppercase bg-blue-50 px-2 py-1 rounded">{selectedProduct.category}</span>
                     <h1 className="text-3xl font-extrabold text-gray-900 mt-2">{selectedProduct.name}</h1>
                     <p className="text-gray-500 font-medium mt-1">型号: <span className="text-gray-800">{selectedProduct.model}</span></p>
                   </div>
                   
                   {/* Hide Support Button for Installers */}
                   {currentUser.role !== UserRole.PARTNER_STAFF && (
                     <button 
                      onClick={() => onRequestSupport(selectedProduct.id)}
                      className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition shadow-md font-semibold"
                     >
                      <LifeBuoy size={18} />
                      技术支持
                     </button>
                   )}
                </div>

                {/* Rich Text Description */}
                <div className="mt-6 text-gray-600 leading-relaxed prose prose-blue max-w-none">
                   <div dangerouslySetInnerHTML={{ __html: selectedProduct.descriptionHtml }} />
                </div>

                {/* Specs Summary */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-bold text-gray-500 uppercase mb-3">关键参数</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedProduct.specs.map((spec, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <p className="text-xs text-gray-500 uppercase font-semibold">{spec.label}</p>
                        <p className="font-medium text-gray-900 mt-1">{spec.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Downloads */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-3">资料下载</h3>
                <div className="flex flex-wrap gap-3">
                  {selectedProduct.documents.map((doc, idx) => (
                    <a key={idx} href={doc.url} className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition text-sm font-medium text-gray-700 bg-white">
                      <Download size={16} />
                      {doc.title}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Accordion */}
          <div className="border-t border-gray-200 p-8 bg-gray-50">
            <h3 className="text-xl font-bold text-gray-900 mb-6">常见问题 (FAQ)</h3>
            <div className="space-y-3 max-w-3xl">
              {selectedProduct.faqs.map((faq, idx) => (
                <FAQItem key={idx} question={faq.question} answer={faq.answer} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- List View ---
  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">产品中心</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map(product => (
          <div 
            key={product.id} 
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col"
            onClick={() => setSelectedProduct(product)}
          >
            <div className="h-56 bg-gray-100 overflow-hidden flex items-center justify-center p-6 relative">
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-all duration-300"></div>
              <img src={product.imageUrl} alt={product.name} className="max-h-full max-w-full transform group-hover:scale-105 transition duration-300 drop-shadow-md" />
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex-1">
                <span className="text-xs font-bold text-blue-600 uppercase bg-blue-50 px-2 py-1 rounded mb-2 inline-block">{product.category}</span>
                <h3 className="text-xl font-bold text-gray-900 mt-1 leading-tight group-hover:text-blue-700 transition-colors">{product.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{product.model}</p>
              </div>
              
              <div className="flex items-center justify-between pt-5 border-t border-gray-100 mt-5">
                 <div className="flex gap-2">
                    <span className="px-2 py-1 bg-gray-100 text-xs font-medium rounded text-gray-600 flex items-center gap-1">
                       <FileText size={12}/> {product.documents.length} 文档
                    </span>
                 </div>
                 <span className="text-blue-600 text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                   查看详情 <ArrowRight size={16} />
                 </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <button 
        className="w-full flex items-center justify-between p-4 text-left font-semibold text-gray-800 hover:bg-gray-50 transition"
        onClick={() => setIsOpen(!isOpen)}
      >
        {question}
        {isOpen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
      </button>
      {isOpen && (
        <div className="p-4 pt-0 text-gray-600 text-sm border-t border-gray-100 bg-gray-50 leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
};

export default Products;
