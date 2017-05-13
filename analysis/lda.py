
import gensim
from nltk.corpus import stopwords
from nltk.stem.porter import PorterStemmer
from gensim import corpora, models

data = pd.read_csv("data/dataset-fb-valence-arousal-anon.csv")

stop_english = stopwords.words("english")

tokenizer = RegexpTokenizer(r"\w+")
sentences = [ tokenizer.tokenize(sent) for sent in data["Anonymized Message"] ]
sentences = [ [word for word in sent if word not in stop_english]
              for sent in sentences ]

stemmer = PorterStemmer()

stemmed_sents = [ [stemmer.stem(word) for word in sent] for sent in sentences ]

dictionary = corpora.Dictionary(stemmed_sents)
corpus = [dictionary.doc2bow(sent) for sent in stemmed_sents]
ldamodel = gensim.models.ldamodel.LdaModel(corpus,
                                           id2word = dictionary,
                                           passes = 20,
                                           num_topics = 3)

